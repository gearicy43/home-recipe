import { useChat } from '../../hooks/useChat'
import { REGION_TAGS, FLAVOR_TAGS, SPEED_TAGS } from '@shared/types'

export function QuickTags() {
  const { setInput } = useChat()

  const handleTagClick = (tag: string) => {
    setInput((prev) => {
      const separator = prev ? '，' : ''
      return prev + separator + tag
    })
  }

  const TagGroup = ({ title, tags }: { title: string; tags: readonly string[] }) => (
    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium shrink-0">{title}</span>
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => handleTagClick(tag)}
          className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-white dark:bg-slate-800 hover:bg-recipe-50 dark:hover:bg-recipe-900/30 text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-full transition-colors hover:border-recipe-300 dark:hover:border-recipe-700"
        >
          {tag}
        </button>
      ))}
    </div>
  )

  return (
    <div className="space-y-1.5 sm:space-y-2">
      <TagGroup title="地域" tags={REGION_TAGS} />
      <TagGroup title="口味" tags={FLAVOR_TAGS} />
      <TagGroup title="时间" tags={SPEED_TAGS} />
    </div>
  )
}
