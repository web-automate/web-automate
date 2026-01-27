export const AiProvider = {
  ANTHROPIC: 'anthropic',
  OPENAI: 'openai',
  GOOGLE: 'google',
  GROQ: 'groq',
  DEEPSEEK: 'deepseek',
  MISTRAL: 'mistral',
  OPENROUTER: 'openrouter',
  LOCAL: 'local'
} as const;

export type AiProviderType = typeof AiProvider[keyof typeof AiProvider];