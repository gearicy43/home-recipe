import { RecipeSource, RawRecipeData } from '@shared/types'

// 纯 AI 数据源 - 第一版只实现这个
export const aiSource: RecipeSource = {
  name: 'ai-knowledge',
  async fetch(keyword: string): Promise<RawRecipeData[]> {
    // AI 不需要额外数据源，直接返回空
    // Claude 会根据用户输入和内置知识生成菜谱
    return []
  },
}

// 数据源管理器 - 预留扩展接口
export class RecipeSourceManager {
  private sources: RecipeSource[] = []

  constructor() {
    // 默认只使用 AI 数据源
    this.sources.push(aiSource)
  }

  registerSource(source: RecipeSource): void {
    this.sources.push(source)
  }

  async fetchAll(keyword: string): Promise<RawRecipeData[]> {
    const results = await Promise.all(
      this.sources.map(source => source.fetch(keyword))
    )
    return results.flat()
  }
}

export const sourceManager = new RecipeSourceManager()
