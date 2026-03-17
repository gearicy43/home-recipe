import { Recipe } from '@shared/types'
import { IngredientTag } from './IngredientTag'

interface RecipeCardProps {
  recipe: Recipe
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <div className="w-full bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden mt-2">
      {/* 头部 */}
      <div className="bg-gradient-to-r from-recipe-500 to-recipe-600 px-3 sm:px-4 py-2.5 sm:py-3">
        <h3 className="text-base sm:text-lg font-bold text-white">{recipe.name}</h3>
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-1">
          <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">
            {recipe.region}
          </span>
          <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">
            {recipe.flavor}
          </span>
          <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">
            {recipe.difficulty}
          </span>
          <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">
            {recipe.time}
          </span>
        </div>
      </div>

      {/* 热量 */}
      {recipe.calories && (
        <div className="px-3 sm:px-4 py-2 bg-recipe-50 dark:bg-recipe-900/20 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm">
            <span className="flex items-center gap-1 text-recipe-700 dark:text-recipe-300">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              </svg>
              {recipe.calories.total} {recipe.calories.unit}
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              (每份 {recipe.calories.per_serving} {recipe.calories.unit} / {recipe.calories.servings}人份)
            </span>
          </div>
        </div>
      )}

      {/* 食材 */}
      <div className="px-3 sm:px-4 py-2.5 sm:py-3">
        <h4 className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 sm:mb-2 flex items-center gap-1">
          <span>🥬</span> 食材
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {recipe.ingredients.map((ing, idx) => (
            <IngredientTag key={idx} name={ing.name} amount={ing.amount} type="ingredient" />
          ))}
        </div>
      </div>

      {/* 调料 */}
      <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-t border-slate-100 dark:border-slate-700">
        <h4 className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 sm:mb-2 flex items-center gap-1">
          <span>🧂</span> 调料
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {recipe.seasonings.map((sea, idx) => (
            <IngredientTag key={idx} name={sea.name} amount={sea.amount} type="seasoning" />
          ))}
        </div>
      </div>

      {/* 步骤 */}
      <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-t border-slate-100 dark:border-slate-700">
        <h4 className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 sm:mb-2 flex items-center gap-1">
          <span>👨‍🍳</span> 步骤
        </h4>
        <ol className="space-y-1.5 sm:space-y-2">
          {recipe.steps.map((step, idx) => (
            <li key={idx} className="flex gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              <span className="w-4 h-4 sm:w-5 sm:h-5 bg-recipe-100 dark:bg-recipe-900/30 text-recipe-700 dark:text-recipe-300 rounded-full flex items-center justify-center text-xs font-medium shrink-0">
                {idx + 1}
              </span>
              <span className="leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* 小贴士 */}
      {recipe.tips && (
        <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-yellow-50 dark:bg-yellow-900/20 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-start gap-1.5 sm:gap-2 text-xs sm:text-sm text-yellow-800 dark:text-yellow-200">
            <span className="text-base sm:text-lg">💡</span>
            <span>{recipe.tips}</span>
          </div>
        </div>
      )}
    </div>
  )
}
