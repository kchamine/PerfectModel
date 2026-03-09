import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatScore(score: number): string {
  return score.toFixed(1)
}

export function formatContextWindow(tokens: number | null): string {
  if (!tokens) return 'Unknown'
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(0)}M tokens`
  if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(0)}K tokens`
  return `${tokens} tokens`
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Unknown'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function getPricingBadgeColor(tier: string | null): string {
  switch (tier) {
    case 'free':        return 'bg-green-100 text-green-800'
    case 'freemium':    return 'bg-blue-100 text-blue-800'
    case 'paid':        return 'bg-purple-100 text-purple-800'
    case 'api-only':    return 'bg-yellow-100 text-yellow-800'
    case 'open-source': return 'bg-orange-100 text-orange-800'
    default:            return 'bg-gray-100 text-gray-800'
  }
}

export function scoreToColor(score: number): string {
  if (score >= 4.5) return 'text-green-500'
  if (score >= 3.5) return 'text-yellow-500'
  if (score >= 2.5) return 'text-orange-500'
  return 'text-red-500'
}

const PROVIDER_DOMAINS: Record<string, string> = {
  'OpenAI':           'openai.com',
  'Anthropic':        'anthropic.com',
  'Google':           'google.com',
  'Meta':             'meta.com',
  'Mistral AI':       'mistral.ai',
  'xAI':              'x.ai',
  'Microsoft':        'microsoft.com',
  'Amazon':           'aws.amazon.com',
  'DeepSeek':         'deepseek.com',
  'Cohere':           'cohere.com',
  'NVIDIA':           'nvidia.com',
  'Perplexity':       'perplexity.ai',
  'Together AI':      'together.ai',
  'Databricks':       'databricks.com',
  'Inflection':       'inflection.ai',
  'AI21 Labs':        'ai21.com',
  'Writer':           'writer.com',
  'Nous Research':    'nousresearch.com',
  'Alibaba (Qwen)':   'alibaba.com',
  'ByteDance':        'bytedance.com',
  'Tencent':          'tencent.com',
  'Baidu':            'baidu.com',
}

export function getProviderLogoUrl(provider: string): string | null {
  const domain = PROVIDER_DOMAINS[provider]
  if (!domain) return null
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
}
