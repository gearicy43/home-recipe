import { useState } from 'react'
import { ChatInput } from './ChatInput'
import { ChatMessage } from './ChatMessage'
import { QuickTags } from './QuickTags'
import { RecipeCard } from '../recipe/RecipeCard'
import { useChat } from '../../hooks/useChat'

interface ChatContainerProps {
  chat: ReturnType<typeof useChat>
}

function formatDate(timestamp: number) {
  const date = new Date(timestamp)
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function ChatContainer({ chat }: ChatContainerProps) {
  const { messages, isLoading, input, setInput, sendMessage, error, sessions, currentSessionId, newSession, loadSession, deleteSession } = chat
  const [showSessions, setShowSessions] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showQuickTags, setShowQuickTags] = useState(false)

  // 找到最新的菜谱（最后一条包含 recipe 的 assistant 消息）
  const latestRecipe = [...messages].reverse().find(m => m.role === 'assistant' && m.recipe)?.recipe

  // 历史对话（除了最新菜谱对应的消息）
  const historyMessages = latestRecipe
    ? messages.filter(m => !(m.role === 'assistant' && m.recipe === latestRecipe))
    : messages

  return (
    <div className="flex flex-col flex-1 gap-3 sm:gap-4 min-h-0">
      {/* 会话管理栏 */}
      <div className="flex items-center justify-between shrink-0 gap-2">
        {/* QuickTags 折叠按钮 */}
        <button
          onClick={() => setShowQuickTags(!showQuickTags)}
          className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <span className="hidden sm:inline">推荐标签</span>
          <span className="sm:hidden">标签</span>
          <svg
            className={`w-3 h-3 transition-transform ${showQuickTags ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div className="relative">
          <button
            onClick={() => setShowSessions(!showSessions)}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="hidden sm:inline">历史</span>
            {sessions.length > 0 && (
              <span className="ml-0.5 text-xs bg-slate-200 dark:bg-slate-600 px-1 sm:px-1.5 rounded-full">{sessions.length}</span>
            )}
          </button>

          {showSessions && (
            <div className="absolute right-0 top-full mt-2 w-64 sm:w-72 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-2 max-h-80 overflow-y-auto z-10">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">历史会话</span>
                <button
                  onClick={() => {
                    newSession()
                    setShowSessions(false)
                  }}
                  className="text-xs text-recipe-600 hover:text-recipe-700 flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  新建
                </button>
              </div>
              {sessions.length === 0 ? (
                <div className="px-4 py-6 text-sm text-slate-400 text-center">
                  暂无历史会话
                </div>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`
                      flex items-center justify-between px-3 py-2 mx-2 rounded-lg cursor-pointer group
                      ${session.id === currentSessionId
                        ? 'bg-recipe-50 dark:bg-recipe-900/30 text-recipe-700 dark:text-recipe-300'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }
                    `}
                  >
                    <button
                      onClick={() => {
                        loadSession(session.id)
                        setShowSessions(false)
                      }}
                      className="flex-1 text-left text-sm min-w-0"
                    >
                      <div className="font-medium truncate">{session.title}</div>
                      <div className="text-xs opacity-60">{formatDate(session.updatedAt)}</div>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteSession(session.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* QuickTags 展开区域 */}
      {showQuickTags && (
        <div className="shrink-0">
          <QuickTags />
        </div>
      )}

      {/* 主内容区 - 自适应高度 */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-3 sm:space-y-4 pb-4">
        {/* 历史对话（可折叠） */}
        {historyMessages.length > 0 && (
          <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shrink-0">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full px-3 sm:px-4 py-2 bg-slate-50 dark:bg-slate-800 flex items-center justify-between text-xs sm:text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <span>对话过程 ({historyMessages.length} 条)</span>
              <svg
                className={`w-4 h-4 transition-transform ${showHistory ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showHistory && (
              <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 bg-white dark:bg-slate-900">
                {historyMessages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* 最新菜谱（重点展示）- 宽度固定，不压缩 */}
        {latestRecipe && (
          <div className="space-y-2 shrink-0">
            <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 px-1">
              为您推荐的菜谱：
            </div>
            <RecipeCard recipe={latestRecipe} />
          </div>
        )}

        {/* 没有菜谱时的普通对话展示 */}
        {!latestRecipe && messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-slate-500 pl-12 shrink-0">
            <div className="w-2 h-2 bg-recipe-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-recipe-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-recipe-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm shrink-0">
            {error}
          </div>
        )}
      </div>

      <ChatInput
        value={input}
        onChange={setInput}
        onSend={sendMessage}
        isLoading={isLoading}
      />
    </div>
  )
}
