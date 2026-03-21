import { useState } from 'react'
import { ChatMessage as ChatMessageType } from '@shared/types'
import { RecipeCard } from '../recipe/RecipeCard'

interface ChatMessageProps {
  message: ChatMessageType
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const [isExpanded, setIsExpanded] = useState(false)

  // 只显示纯文本内容，不解析菜谱数据（菜谱数据由 useChat 解析后通过 recipe 字段传递）
  const textContent = message.content.replace(/```json\n[\s\S]*?\n```/g, '').trim()

  // 用户消息默认折叠（如果内容较长）
  const shouldCollapse = isUser && textContent.length > 30
  const displayContent = shouldCollapse && !isExpanded
    ? textContent.slice(0, 30) + '...'
    : textContent

  return (
    <div className={`flex gap-2 sm:gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`
        w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm sm:text-base
        ${isUser
          ? 'bg-recipe-500 text-white'
          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
        }
      `}>
        {isUser ? '👤' : '🍳'}
      </div>

      <div className={`flex flex-col gap-1.5 sm:gap-2 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`
          px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm leading-relaxed
          ${isUser
            ? 'bg-recipe-500 text-white rounded-tr-sm'
            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-sm shadow-sm border border-slate-200 dark:border-slate-700'
          }
        `}>
          {displayContent || <span className="italic opacity-70">正在输入...</span>}
          {shouldCollapse && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="ml-1.5 sm:ml-2 text-xs opacity-70 hover:opacity-100 underline"
            >
              {isExpanded ? '收起' : '展开'}
            </button>
          )}
        </div>

        {/* 只在消息完成且有菜谱数据时显示卡片 */}
        {message.recipe && <RecipeCard recipe={message.recipe} />}
      </div>
    </div>
  )
}
