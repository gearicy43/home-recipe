interface IngredientTagProps {
  name: string
  amount: string
  type: 'ingredient' | 'seasoning'
}

export function IngredientTag({ name, amount, type }: IngredientTagProps) {
  const baseClasses = "inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs border"
  
  const typeClasses = {
    ingredient: "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800",
    seasoning: "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
  }

  return (
    <span className={`${baseClasses} ${typeClasses[type]}`}>
      <span className="font-medium">{name}</span>
      <span className="opacity-75">{amount}</span>
    </span>
  )
}
