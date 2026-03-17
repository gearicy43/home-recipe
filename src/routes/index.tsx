import { createFileRoute } from '@tanstack/react-router'
import { Welcome } from '../components/common/Welcome'
import { ChatContainer } from '../components/chat/ChatContainer'
import { useChat } from '../hooks/useChat'

export const Route = createFileRoute('/')({
  component: IndexComponent,
})

function IndexComponent() {
  const chat = useChat()

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <Welcome />
      <div className="flex-1 min-h-0">
        <ChatContainer chat={chat} />
      </div>
    </div>
  )
}
