import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import cors from 'cors'
import express from 'express'
import { AIProviderType, DEFAULT_BASE_URLS } from '../shared/types'

const app = express()
app.use(cors())
app.use(express.json())

const SYSTEM_PROMPT = `你是家庭菜谱助手，帮助用户推荐菜谱和解答烹饪问题。

## 角色设定
- 你是一位经验丰富的家庭厨师，熟悉各种家常菜做法
- 你善于根据用户手头食材推荐可做的菜
- 你能提供食材替代建议
- 你能根据用户需求调整菜谱（简化步骤、调整口味等）

## 输出格式
当推荐菜谱时，请使用以下 JSON 格式（作为消息的一部分）：

\`\`\`json
{
  "name": "菜名",
  "region": "菜系（如：川菜、粤菜、家常菜）",
  "flavor": "口味（如：咸鲜、麻辣、酸甜）",
  "difficulty": "难度（简单/中等/困难）",
  "time": "烹饪时间（如：15分钟）",
  "calories": {
    "total": 280,
    "unit": "kcal",
    "per_serving": 140,
    "servings": 2
  },
  "ingredients": [
    {"name": "食材名", "amount": "用量"}
  ],
  "seasonings": [
    {"name": "调料名", "amount": "用量"}
  ],
  "steps": [
    "步骤1",
    "步骤2"
  ],
  "tips": "小贴士（可选）"
}
\`\`\`

注意：
1. JSON 代码块前后可以有自然语言解释
2. 如果不需要推荐菜谱（如只是闲聊或回答简单问题），可以不带 JSON 代码块
3. 热量数据是估算值，请基于常见食材给出合理估算
4. 步骤要清晰易懂，适合家庭厨房操作

## 对话场景
- "我想吃XX" → 推荐该菜的做法
- "我有土豆、鸡蛋" → 根据现有食材推荐
- "酱油没有" → 提供替代方案
- "简单点" → 简化步骤
- "川菜" / "清淡点" → 按口味偏好推荐
- "快手菜" / "15分钟" → 按时间要求推荐
- "多少卡路里" → 回答热量信息`

interface ChatRequest {
  messages: { role: string; content: string }[]
  provider: AIProviderType
  apiKey: string
  model: string
  baseUrl?: string
}

async function handleAnthropicStream(req: ChatRequest, res: express.Response) {
  const anthropic = new Anthropic({
    apiKey: req.apiKey,
    ...(req.baseUrl ? { baseURL: req.baseUrl } : {}),
  })

  const stream = await anthropic.messages.create({
    model: req.model,
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: req.messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    stream: true,
  })

  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
      res.write(`data: ${JSON.stringify({ content: chunk.delta.text })}\n\n`)
    }
  }
}

async function handleOpenAIStream(req: ChatRequest, res: express.Response) {
  const openai = new OpenAI({
    apiKey: req.apiKey,
    baseURL: req.baseUrl || DEFAULT_BASE_URLS.openai,
  })

  const stream = await openai.chat.completions.create({
    model: req.model,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      ...req.messages.map((m) => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
      })),
    ],
    stream: true,
  })

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content
    if (content) {
      res.write(`data: ${JSON.stringify({ content })}\n\n`)
    }
  }
}

async function handleOpenRouterStream(req: ChatRequest, res: express.Response) {
  const openai = new OpenAI({
    apiKey: req.apiKey,
    baseURL: 'https://openrouter.ai/api/v1',
  })

  const stream = await openai.chat.completions.create({
    model: req.model,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      ...req.messages.map((m) => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
      })),
    ],
    stream: true,
  })

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content
    if (content) {
      res.write(`data: ${JSON.stringify({ content })}\n\n`)
    }
  }
}

app.post('/api/chat', async (req, res) => {
  const { messages, provider, apiKey, model, baseUrl } = req.body as ChatRequest

  if (!apiKey) {
    return res.status(400).json({ error: '缺少 API Key' })
  }
  if (!provider) {
    return res.status(400).json({ error: '缺少 AI 服务商配置' })
  }

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  try {
    const chatReq: ChatRequest = { messages, provider, apiKey, model, baseUrl }

    switch (provider) {
      case 'anthropic':
        await handleAnthropicStream(chatReq, res)
        break
      case 'openai':
        await handleOpenAIStream(chatReq, res)
        break
      case 'openrouter':
        await handleOpenRouterStream(chatReq, res)
        break
      default:
        res.status(400).json({ error: `不支持的服务商: ${provider}` })
        return
    }

    res.write('data: [DONE]\n\n')
    res.end()
  } catch (error: any) {
    console.error(`${provider} API Error:`, error)
    // 如果 headers 还没发送，返回 JSON 错误
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || 'AI 服务调用失败' })
    } else {
      // 已经在 streaming，写入错误事件
      res.write(`data: ${JSON.stringify({ error: error.message || 'AI 服务调用失败' })}\n\n`)
      res.end()
    }
  }
})

const PORT = process.env.PORT || 33007
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
