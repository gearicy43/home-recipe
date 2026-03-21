export interface Recipe {
  name: string
  region: string
  flavor: string
  difficulty: string
  time: string
  calories?: {
    total: number
    unit: string
    per_serving: number
    servings: number
  }
  ingredients: Ingredient[]
  seasonings: Ingredient[]
  steps: string[]
  tips?: string
}

export interface Ingredient {
  name: string
  amount: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  recipe?: Recipe
  timestamp: number
}

export type AIProviderType = 'openai' | 'anthropic' | 'openrouter' | 'pi-mono'

export interface AIProviderConfig {
  provider: AIProviderType
  apiKey: string
  model: string
  baseUrl?: string
}

export const DEFAULT_MODELS: Record<AIProviderType, string> = {
  openai: 'gpt-4o',
  anthropic: 'claude-3-5-sonnet-20241022',
  openrouter: 'openai/gpt-4o',
  'pi-mono': 'claude-sonnet-4-20250514',
}

export const DEFAULT_BASE_URLS: Record<'openai' | 'anthropic', string> = {
  openai: 'https://api.openai.com/v1',
  anthropic: 'https://api.anthropic.com',
}

export interface RecipeSource {
  name: string
  fetch: (keyword: string) => Promise<RawRecipeData[]>
}

export interface RawRecipeData {
  source: string
  title: string
  content: string
  url?: string
}

export type RegionTag = '川菜' | '粤菜' | '湘菜' | '江浙菜' | '东北菜' | '西北菜'
export type FlavorTag = '辣' | '清淡' | '酸甜' | '咸鲜' | '麻辣'
export type SpeedTag = '快手菜 <15分钟' | '家常 15-30分钟' | '慢炖 >30分钟'

export const REGION_TAGS: RegionTag[] = ['川菜', '粤菜', '湘菜', '江浙菜', '东北菜', '西北菜']
export const FLAVOR_TAGS: FlavorTag[] = ['辣', '清淡', '酸甜', '咸鲜', '麻辣']
export const SPEED_TAGS: SpeedTag[] = ['快手菜 <15分钟', '家常 15-30分钟', '慢炖 >30分钟']
