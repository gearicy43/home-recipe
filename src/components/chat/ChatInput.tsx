import { useState, KeyboardEvent, useEffect } from 'react'
import { AIProviderType, AIProviderConfig, DEFAULT_MODELS, DEFAULT_BASE_URLS } from '@shared/types'

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  isLoading: boolean
}

const PROVIDER_LABELS: Record<AIProviderType, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  openrouter: 'OpenRouter',
}

function loadProviderConfig(): AIProviderConfig {
  const raw = localStorage.getItem('ai_provider_config')
  if (raw) {
    try { return JSON.parse(raw) } catch {}
  }
  return { provider: 'openai', apiKey: '', model: DEFAULT_MODELS.openai }
}

function saveProviderConfig(config: AIProviderConfig) {
  localStorage.setItem('ai_provider_config', JSON.stringify(config))
}

export function ChatInput({ value, onChange, onSend, isLoading }: ChatInputProps) {
  const [showSettings, setShowSettings] = useState(false)
  const [config, setConfig] = useState<AIProviderConfig>(loadProviderConfig)
  const [savedConfig, setSavedConfig] = useState<AIProviderConfig>(loadProviderConfig)
  const [showBaseUrl, setShowBaseUrl] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'unsaved' | 'saving'>('saved')

  useEffect(() => {
    // 检查配置是否有未保存的更改
    const hasChanges = JSON.stringify(config) !== JSON.stringify(savedConfig)
    setSaveStatus(hasChanges ? 'unsaved' : 'saved')
  }, [config, savedConfig])

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (value.trim() && !isLoading) {
        onSend()
      }
    }
  }

  const switchProvider = (provider: AIProviderType) => {
    setConfig((prev) => ({
      ...prev,
      provider,
      model: DEFAULT_MODELS[provider],
      baseUrl: undefined,
    }))
    setShowBaseUrl(false)
  }

  const handleSave = () => {
    setSaveStatus('saving')
    saveProviderConfig(config)
    setSavedConfig(config)
    setTimeout(() => {
      setSaveStatus('saved')
      setShowSettings(false)
    }, 300)
  }

  const hasChanges = saveStatus === 'unsaved'
  const hasBaseUrl = config.provider === 'openai' || config.provider === 'anthropic'

  return (
    <div className="sticky bottom-0 bg-slate-50 dark:bg-slate-900 pt-2 pb-3 sm:pb-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-2.5 sm:p-3">
        <div className="flex items-end gap-1.5 sm:gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            title="AI 设置"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="想吃什么？告诉我..."
            rows={1}
            className="flex-1 bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 resize-none outline-none text-sm py-1.5 sm:py-2"
            style={{ minHeight: '20px', maxHeight: '100px' }}
          />
          
          <button
            onClick={onSend}
            disabled={!value.trim() || isLoading}
            className={`
              p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all duration-200
              ${value.trim() && !isLoading
                ? 'bg-recipe-500 text-white hover:bg-recipe-600 shadow-md'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
              }
            `}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="mt-2 sm:mt-3 p-3 sm:p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg space-y-3 sm:space-y-4">
          {/* 当前配置显示 */}
          <div className="p-2.5 sm:p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">当前配置</span>
              {hasChanges && (
                <span className="text-xs text-amber-500 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  未保存
                </span>
              )}
              {saveStatus === 'saved' && !hasChanges && (
                <span className="text-xs text-green-500 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  已保存
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400">服务商:</span>
                <span className="ml-1 font-medium text-slate-700 dark:text-slate-200">{PROVIDER_LABELS[config.provider]}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">模型:</span>
                <span className="ml-1 font-medium text-slate-700 dark:text-slate-200 truncate block" title={config.model}>{config.model}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 dark:text-slate-400">API Key:</span>
                <span className="ml-1 font-mono text-slate-700 dark:text-slate-200">{config.apiKey ? `${config.apiKey.slice(0, 8)}...${config.apiKey.slice(-4)}` : '未设置'}</span>
              </div>
              {config.baseUrl && (
                <div className="col-span-2">
                  <span className="text-slate-500 dark:text-slate-400">Base URL:</span>
                  <span className="ml-1 font-mono text-slate-700 dark:text-slate-200 truncate block" title={config.baseUrl}>{config.baseUrl}</span>
                </div>
              )}
            </div>
          </div>

          {/* Provider 选择 */}
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 sm:mb-2">
              AI 服务商
            </label>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {(Object.keys(PROVIDER_LABELS) as AIProviderType[]).map((p) => (
                <button
                  key={p}
                  onClick={() => switchProvider(p)}
                  className={`
                    px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors
                    ${config.provider === p
                      ? 'bg-recipe-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }
                  `}
                >
                  {PROVIDER_LABELS[p]}
                </button>
              ))}
            </div>
          </div>

          {/* API Key */}
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 sm:mb-1.5">
              API Key
            </label>
            <input
              type="password"
              value={config.apiKey}
              onChange={(e) => setConfig((prev) => ({ ...prev, apiKey: e.target.value }))}
              placeholder={
                config.provider === 'openai' ? 'sk-...' :
                config.provider === 'anthropic' ? 'sk-ant-api03-...' :
                'sk-or-...'
              }
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-recipe-500 text-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Model */}
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 sm:mb-1.5">
              Model
            </label>
            <input
              type="text"
              value={config.model}
              onChange={(e) => setConfig((prev) => ({ ...prev, model: e.target.value }))}
              placeholder={DEFAULT_MODELS[config.provider]}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-recipe-500 text-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Base URL (仅 OpenAI / Anthropic) */}
          {hasBaseUrl && (
            <div>
              {!showBaseUrl ? (
                <button
                  onClick={() => setShowBaseUrl(true)}
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  + 自定义 Base URL
                </button>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Base URL
                    </label>
                    <button
                      onClick={() => {
                        setShowBaseUrl(false)
                        setConfig((prev) => ({ ...prev, baseUrl: undefined }))
                      }}
                      className="text-xs text-slate-400 hover:text-red-500 transition-colors"
                    >
                      移除
                    </button>
                  </div>
                  <input
                    type="text"
                    value={config.baseUrl || ''}
                    onChange={(e) => setConfig((prev) => ({ ...prev, baseUrl: e.target.value || undefined }))}
                    placeholder={DEFAULT_BASE_URLS[config.provider as 'openai' | 'anthropic']}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-recipe-500 text-slate-800 dark:text-slate-100"
                  />
                </>
              )}
            </div>
          )}

          {/* 保存按钮 */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={() => {
                setConfig(savedConfig)
                setShowSettings(false)
              }}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges || saveStatus === 'saving'}
              className={`
                px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5
                ${hasChanges
                  ? 'bg-recipe-500 text-white hover:bg-recipe-600 shadow-md'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                }
              `}
            >
              {saveStatus === 'saving' ? (
                <>
                  <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  保存中...
                </>
              ) : hasChanges ? (
                <>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  保存配置
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  已保存
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
