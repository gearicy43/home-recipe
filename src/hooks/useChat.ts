import { useState, useCallback } from 'react'
import { ChatMessage, Recipe, AIProviderConfig, DEFAULT_MODELS } from '@shared/types'

const generateId = () => Math.random().toString(36).substring(2, 9)

function loadProviderConfig(): AIProviderConfig {
  const raw = localStorage.getItem('ai_provider_config')
  if (raw) {
    try { return JSON.parse(raw) } catch {}
  }
  return { provider: 'openai', apiKey: '', model: DEFAULT_MODELS.openai }
}

export interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: number
  updatedAt: number
}

function loadSessions(): ChatSession[] {
  const raw = localStorage.getItem('chat_sessions')
  if (raw) {
    try { return JSON.parse(raw) } catch {}
  }
  return []
}

function saveSessions(sessions: ChatSession[]) {
  localStorage.setItem('chat_sessions', JSON.stringify(sessions))
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessions, setSessions] = useState<ChatSession[]>(loadSessions)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)

  const newSession = useCallback(() => {
    // 保存当前会话
    if (currentSessionId && messages.length > 0) {
      const title = messages[0]?.content.slice(0, 20) || '新对话'
      setSessions((prev) => {
        const others = prev.filter((s) => s.id !== currentSessionId)
        const updated: ChatSession = {
          id: currentSessionId,
          title,
          messages,
          createdAt: prev.find((s) => s.id === currentSessionId)?.createdAt || Date.now(),
          updatedAt: Date.now(),
        }
        const newSessions = [updated, ...others].slice(0, 20) // 最多保留20个
        saveSessions(newSessions)
        return newSessions
      })
    }
    // 开始新会话
    setMessages([])
    setCurrentSessionId(generateId())
    setError(null)
  }, [currentSessionId, messages])

  const loadSession = useCallback((sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId)
    if (session) {
      // 先保存当前
      if (currentSessionId && messages.length > 0) {
        const title = messages[0]?.content.slice(0, 20) || '新对话'
        setSessions((prev) => {
          const others = prev.filter((s) => s.id !== currentSessionId)
          const updated: ChatSession = {
            id: currentSessionId,
            title,
            messages,
            createdAt: prev.find((s) => s.id === currentSessionId)?.createdAt || Date.now(),
            updatedAt: Date.now(),
          }
          const newSessions = [updated, ...others].slice(0, 20)
          saveSessions(newSessions)
          return newSessions
        })
      }
      setMessages(session.messages)
      setCurrentSessionId(sessionId)
      setError(null)
    }
  }, [sessions, currentSessionId, messages])

  const deleteSession = useCallback((sessionId: string) => {
    setSessions((prev) => {
      const newSessions = prev.filter((s) => s.id !== sessionId)
      saveSessions(newSessions)
      return newSessions
    })
    if (currentSessionId === sessionId) {
      setMessages([])
      setCurrentSessionId(null)
    }
  }, [currentSessionId])

  const sendMessage = useCallback(async () => {
    if (!input.trim()) return

    const config = loadProviderConfig()
    if (!config.apiKey) {
      setError('请先在设置中配置 API Key（点击齿轮按钮）')
      return
    }

    // 确保有当前会话
    if (!currentSessionId) {
      setCurrentSessionId(generateId())
    }

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setError(null)

    const assistantMessage: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, assistantMessage])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          provider: config.provider,
          apiKey: config.apiKey,
          model: config.model,
          baseUrl: config.baseUrl,
        }),
      })

      if (!response.ok) {
        const errBody = await response.json().catch(() => null)
        throw new Error(errBody?.error || '请求失败')
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('无法读取响应')
      }

      const decoder = new TextDecoder()
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                fullContent += parsed.content
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMessage.id
                      ? { ...m, content: fullContent }
                      : m
                  )
                )
              }
            } catch {
              // 忽略解析错误
            }
          }
        }
      }

      // 尝试解析菜谱数据
      const jsonMatch = fullContent.match(/```json\n([\s\S]*?)\n```/)
      if (jsonMatch) {
        try {
          const recipe: Recipe = JSON.parse(jsonMatch[1])
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessage.id ? { ...m, recipe } : m
            )
          )
        } catch {
          // JSON 解析失败，忽略
        }
      }
    } catch (err: any) {
      setError(err.message || '发送消息失败')
      setMessages((prev) => prev.filter((m) => m.id !== assistantMessage.id))
    } finally {
      setIsLoading(false)
    }
  }, [input, messages, currentSessionId])

  return {
    messages,
    isLoading,
    input,
    setInput,
    sendMessage,
    error,
    sessions,
    currentSessionId,
    newSession,
    loadSession,
    deleteSession,
  }
}
