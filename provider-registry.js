(function() {
  'use strict';

  const BRAND = {
    name: 'BrowserKing',
    shortName: 'BrowserKing',
    description: 'Open browser agent for your own LLM providers'
  };

  const STORAGE_KEY = 'browserKingProviderState';
  const LEGACY_PROVIDER_KEY = 'providerConfig';

  function createModel(id, name, options) {
    return {
      id,
      name,
      description: options?.description || '',
      supportsVision: Boolean(options?.supportsVision),
      category: options?.category || 'chat'
    };
  }

  const PROVIDERS = {
    anthropic: {
      id: 'anthropic',
      label: 'Anthropic',
      transport: 'anthropic',
      color: '#D97757',
      colorDark: '#F2A488',
      requiresApiKey: true,
      defaultBaseUrl: 'https://api.anthropic.com/v1',
      defaultModel: 'claude-sonnet-4-5',
      models: [
        createModel('claude-haiku-4-5', 'Claude Haiku 4.5', { supportsVision: true }),
        createModel('claude-opus-4-6', 'Claude Opus 4.6', { supportsVision: true }),
        createModel('claude-sonnet-4-6', 'Claude Sonnet 4.6', { supportsVision: true }),
        createModel('claude-opus-4-1', 'Claude Opus 4.1', { supportsVision: true }),
        createModel('claude-opus-4', 'Claude Opus 4', { supportsVision: true }),
        createModel('claude-sonnet-4-5', 'Claude Sonnet 4.5', { supportsVision: true }),
        createModel('claude-sonnet-4', 'Claude Sonnet 4', { supportsVision: true }),
        createModel('claude-3-7-sonnet-latest', 'Claude 3.7 Sonnet', { supportsVision: true }),
        createModel('claude-3-5-haiku-latest', 'Claude 3.5 Haiku', { supportsVision: true })
      ]
    },
    openai: {
      id: 'openai',
      label: 'OpenAI',
      transport: 'openai',
      color: '#0A84FF',
      colorDark: '#6CB4FF',
      requiresApiKey: true,
      defaultBaseUrl: 'https://api.openai.com/v1',
      defaultModel: 'gpt-4.1',
      models: [
        createModel('gpt-5.4-pro', 'GPT-5.4 Pro', { supportsVision: true }),
        createModel('gpt-5.4', 'GPT-5.4', { supportsVision: true }),
        createModel('gpt-5.3-chat', 'GPT-5.3 Chat', { supportsVision: true }),
        createModel('gpt-5.1', 'GPT-5.1', { supportsVision: true }),
        createModel('gpt-5.1-mini', 'GPT-5.1 Mini', { supportsVision: true }),
        createModel('gpt-5.1-nano', 'GPT-5.1 Nano', { supportsVision: true }),
        createModel('gpt-5.2', 'GPT-5.2', { supportsVision: true }),
        createModel('gpt-5.2-mini', 'GPT-5.2 Mini', { supportsVision: true }),
        createModel('gpt-5', 'GPT-5', { supportsVision: true }),
        createModel('gpt-5-mini', 'GPT-5 Mini', { supportsVision: true }),
        createModel('gpt-5-nano', 'GPT-5 Nano', { supportsVision: true }),
        createModel('gpt-5-codex', 'GPT-5 Codex', { supportsVision: false }),
        createModel('gpt-5.1-codex', 'GPT-5.1 Codex', { supportsVision: false }),
        createModel('gpt-5.1-codex-mini', 'GPT-5.1 Codex Mini', { supportsVision: false }),
        createModel('gpt-5.2-codex', 'GPT-5.2 Codex', { supportsVision: false }),
        createModel('gpt-4.1', 'GPT-4.1', { supportsVision: true }),
        createModel('gpt-4.1-mini', 'GPT-4.1 Mini', { supportsVision: true }),
        createModel('gpt-4.1-nano', 'GPT-4.1 Nano', { supportsVision: true }),
        createModel('gpt-4o', 'GPT-4o', { supportsVision: true }),
        createModel('gpt-4o-mini', 'GPT-4o Mini', { supportsVision: true }),
        createModel('o3', 'o3', { supportsVision: true }),
        createModel('o3-pro', 'o3-pro', { supportsVision: true }),
        createModel('o4-mini', 'o4-mini', { supportsVision: true })
      ]
    },
    google: {
      id: 'google',
      label: 'Google Gemini',
      transport: 'openai',
      color: '#1A73E8',
      colorDark: '#8AB4F8',
      requiresApiKey: true,
      defaultBaseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
      defaultModel: 'gemini-2.5-flash',
      models: [
        createModel('gemini-3.1-pro-preview', 'Gemini 3.1 Pro Preview', { supportsVision: true }),
        createModel('gemini-3-pro-preview', 'Gemini 3 Pro Preview', { supportsVision: true }),
        createModel('gemini-3-flash-preview', 'Gemini 3 Flash Preview', { supportsVision: true }),
        createModel('gemini-3.1-flash-lite-preview', 'Gemini 3.1 Flash Lite Preview', { supportsVision: true }),
        createModel('gemini-2.5-pro', 'Gemini 2.5 Pro', { supportsVision: true }),
        createModel('gemini-2.5-flash', 'Gemini 2.5 Flash', { supportsVision: true }),
        createModel('gemini-2.5-flash-lite', 'Gemini 2.5 Flash-Lite', { supportsVision: true }),
        createModel('gemini-2.0-flash', 'Gemini 2.0 Flash', { supportsVision: true }),
        createModel('gemini-2.0-flash-lite', 'Gemini 2.0 Flash-Lite', { supportsVision: true })
      ]
    },
    groq: {
      id: 'groq',
      label: 'Groq',
      transport: 'openai',
      color: '#14B8A6',
      colorDark: '#5EEAD4',
      requiresApiKey: true,
      defaultBaseUrl: 'https://api.groq.com/openai/v1',
      defaultModel: 'llama-3.3-70b-versatile',
      models: [
        createModel('openai/gpt-oss-120b', 'GPT-OSS 120B', { supportsVision: false }),
        createModel('openai/gpt-oss-20b', 'GPT-OSS 20B', { supportsVision: false }),
        createModel('llama-3.3-70b-versatile', 'Llama 3.3 70B Versatile', { supportsVision: false }),
        createModel('llama-3.1-8b-instant', 'Llama 3.1 8B Instant', { supportsVision: false }),
        createModel('qwen/qwen3-32b', 'Qwen 3 32B', { supportsVision: false }),
        createModel('deepseek-r1-distill-qwen-32b', 'DeepSeek R1 Distill Qwen 32B', { supportsVision: false })
      ]
    },
    mistral: {
      id: 'mistral',
      label: 'Mistral',
      transport: 'openai',
      color: '#F97316',
      colorDark: '#FDBA74',
      requiresApiKey: true,
      defaultBaseUrl: 'https://api.mistral.ai/v1',
      defaultModel: 'mistral-large-latest',
      models: [
        createModel('mistral-large-latest', 'Mistral Large', { supportsVision: false }),
        createModel('mistral-medium-latest', 'Mistral Medium', { supportsVision: false }),
        createModel('mistral-small-latest', 'Mistral Small', { supportsVision: false }),
        createModel('ministral-8b-latest', 'Ministral 8B', { supportsVision: false }),
        createModel('ministral-3b-latest', 'Ministral 3B', { supportsVision: false }),
        createModel('pixtral-large-latest', 'Pixtral Large', { supportsVision: true }),
        createModel('pixtral-12b-2409', 'Pixtral 12B', { supportsVision: true }),
        createModel('codestral-latest', 'Codestral', { supportsVision: false }),
        createModel('devstral-small-latest', 'Devstral Small', { supportsVision: false }),
        createModel('magistral-medium-latest', 'Magistral Medium', { supportsVision: false }),
        createModel('magistral-small-latest', 'Magistral Small', { supportsVision: false })
      ]
    },
    xai: {
      id: 'xai',
      label: 'xAI',
      transport: 'openai',
      color: '#0F172A',
      colorDark: '#CBD5E1',
      requiresApiKey: true,
      defaultBaseUrl: 'https://api.x.ai/v1',
      defaultModel: 'grok-2-vision-latest',
      models: [
        createModel('grok-4', 'Grok 4', { supportsVision: true }),
        createModel('grok-3', 'Grok 3', { supportsVision: true }),
        createModel('grok-3-mini', 'Grok 3 Mini', { supportsVision: false }),
        createModel('grok-4.20-beta', 'Grok 4.20 Beta', { supportsVision: true }),
        createModel('grok-4-fast-non-reasoning', 'Grok 4 Fast', { supportsVision: true }),
        createModel('grok-2-vision-latest', 'Grok Vision', { supportsVision: true }),
        createModel('grok-2-latest', 'Grok', { supportsVision: false })
      ]
    },
    together: {
      id: 'together',
      label: 'Together',
      transport: 'openai',
      color: '#0F766E',
      colorDark: '#99F6E4',
      requiresApiKey: true,
      defaultBaseUrl: 'https://api.together.xyz/v1',
      defaultModel: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
      models: [
        createModel('moonshotai/Kimi-K2.5-Instruct', 'Kimi K2.5 Instruct', { supportsVision: false }),
        createModel('Qwen/Qwen3.5-397B-A17B-Thinking', 'Qwen 3.5 397B Thinking', { supportsVision: false }),
        createModel('MiniMaxAI/MiniMax-M2.5', 'MiniMax M2.5', { supportsVision: false }),
        createModel('meta-llama/Llama-3.3-70B-Instruct-Turbo', 'Llama 3.3 70B Turbo', { supportsVision: false }),
        createModel('Qwen/Qwen2.5-7B-Instruct-Turbo', 'Qwen 2.5 7B Turbo', { supportsVision: false }),
        createModel('arcee-ai/Trinity-Small', 'Arcee Trinity Small', { supportsVision: false }),
        createModel('Qwen/Qwen2-VL-72B-Instruct', 'Qwen2 VL 72B', { supportsVision: true })
      ]
    },
    fireworks: {
      id: 'fireworks',
      label: 'Fireworks',
      transport: 'openai',
      color: '#EF4444',
      colorDark: '#FCA5A5',
      requiresApiKey: true,
      defaultBaseUrl: 'https://api.fireworks.ai/inference/v1',
      defaultModel: 'accounts/fireworks/models/qwen2p5-vl-72b-instruct',
      models: [
        createModel('accounts/fireworks/models/qwen2p5-vl-72b-instruct', 'Qwen 2.5 VL 72B', { supportsVision: true }),
        createModel('accounts/fireworks/models/llama-v3p3-70b-instruct', 'Llama 3.3 70B', { supportsVision: false }),
        createModel('accounts/fireworks/models/deepseek-r1', 'DeepSeek R1', { supportsVision: false }),
        createModel('accounts/fireworks/models/kimi-k2-instruct', 'Kimi K2 Instruct', { supportsVision: false }),
        createModel('accounts/fireworks/models/qwen3-235b-a22b', 'Qwen3 235B A22B', { supportsVision: false })
      ]
    },
    cerebras: {
      id: 'cerebras',
      label: 'Cerebras',
      transport: 'openai',
      color: '#22C55E',
      colorDark: '#86EFAC',
      requiresApiKey: true,
      defaultBaseUrl: 'https://api.cerebras.ai/v1',
      defaultModel: 'llama-3.3-70b',
      models: [
        createModel('llama-3.3-70b', 'Llama 3.3 70B', { supportsVision: false }),
        createModel('gpt-oss-120b', 'GPT-OSS 120B', { supportsVision: false }),
        createModel('gpt-oss-20b', 'GPT-OSS 20B', { supportsVision: false }),
        createModel('qwen-3-235b-a22b-instruct-2507', 'Qwen 3 235B A22B', { supportsVision: false })
      ]
    },
    openrouter: {
      id: 'openrouter',
      label: 'OpenRouter',
      transport: 'openai',
      color: '#16A34A',
      colorDark: '#86EFAC',
      requiresApiKey: true,
      defaultBaseUrl: 'https://openrouter.ai/api/v1',
      defaultModel: 'openai/gpt-4o-mini',
      publicModelsUrl: 'https://openrouter.ai/api/v1/models',
      models: [
        createModel('openai/gpt-4o-mini', 'GPT-4o Mini', { supportsVision: true }),
        createModel('anthropic/claude-3.5-sonnet', 'Claude 3.5 Sonnet', { supportsVision: true }),
        createModel('google/gemini-2.0-flash-001', 'Gemini 2.0 Flash', { supportsVision: true }),
        createModel('openai/gpt-5', 'GPT-5', { supportsVision: true }),
        createModel('openai/gpt-5-mini', 'GPT-5 Mini', { supportsVision: true }),
        createModel('openai/o3', 'o3', { supportsVision: true }),
        createModel('openai/o4-mini', 'o4-mini', { supportsVision: true }),
        createModel('anthropic/claude-opus-4.1', 'Claude Opus 4.1', { supportsVision: true }),
        createModel('anthropic/claude-sonnet-4.5', 'Claude Sonnet 4.5', { supportsVision: true }),
        createModel('google/gemini-2.5-pro', 'Gemini 2.5 Pro', { supportsVision: true }),
        createModel('google/gemini-2.5-flash', 'Gemini 2.5 Flash', { supportsVision: true }),
        createModel('x-ai/grok-4.20-beta', 'Grok 4.20 Beta', { supportsVision: true })
      ]
    },
    deepseek: {
      id: 'deepseek',
      label: 'DeepSeek',
      transport: 'openai',
      color: '#2563EB',
      colorDark: '#93C5FD',
      requiresApiKey: true,
      defaultBaseUrl: 'https://api.deepseek.com/v1',
      defaultModel: 'deepseek-chat',
      models: [
        createModel('deepseek-chat', 'DeepSeek Chat', { supportsVision: false }),
        createModel('deepseek-reasoner', 'DeepSeek Reasoner', { supportsVision: false })
      ]
    },
    perplexity: {
      id: 'perplexity',
      label: 'Perplexity',
      transport: 'openai',
      color: '#0891B2',
      colorDark: '#67E8F9',
      requiresApiKey: true,
      defaultBaseUrl: 'https://api.perplexity.ai',
      defaultModel: 'sonar-pro',
      models: [
        createModel('sonar-deep-research', 'Sonar Deep Research', { supportsVision: false }),
        createModel('sonar-pro', 'Sonar Pro', { supportsVision: false }),
        createModel('sonar', 'Sonar', { supportsVision: false }),
        createModel('sonar-reasoning', 'Sonar Reasoning', { supportsVision: false }),
        createModel('sonar-reasoning-pro', 'Sonar Reasoning Pro', { supportsVision: false }),
        createModel('r1-1776', 'R1 1776', { supportsVision: false })
      ]
    },
    nvidia: {
      id: 'nvidia',
      label: 'NVIDIA',
      transport: 'openai',
      color: '#76B900',
      colorDark: '#C7F36A',
      requiresApiKey: true,
      defaultBaseUrl: 'https://integrate.api.nvidia.com/v1',
      defaultModel: 'meta/llama-3.2-90b-vision-instruct',
      publicModelsUrl: 'https://integrate.api.nvidia.com/v1/models',
      models: [
        createModel('meta/llama-3.2-90b-vision-instruct', 'Llama 3.2 90B Vision', { supportsVision: true }),
        createModel('meta/llama-3.1-70b-instruct', 'Llama 3.1 70B', { supportsVision: false }),
        createModel('meta/llama-3.3-70b-instruct', 'Llama 3.3 70B', { supportsVision: false }),
        createModel('meta/llama-4-maverick-17b-128e-instruct', 'Llama 4 Maverick', { supportsVision: false }),
        createModel('meta/llama-4-scout-17b-16e-instruct', 'Llama 4 Scout', { supportsVision: false }),
        createModel('nvidia/nemotron-3-super-120b-a12b', 'Nemotron 3 Super 120B', { supportsVision: false }),
        createModel('nvidia/llama-3.1-nemotron-ultra-253b-v1', 'Llama 3.1 Nemotron Ultra 253B', { supportsVision: false }),
        createModel('nvidia/llama-3.1-nemotron-70b-instruct', 'Llama 3.1 Nemotron 70B', { supportsVision: false }),
        createModel('nvidia/llama-3.1-nemotron-51b-instruct', 'Llama 3.1 Nemotron 51B', { supportsVision: false }),
        createModel('nvidia/nemotron-nano-12b-v2-vl', 'Nemotron Nano 12B V2 VL', { supportsVision: true }),
        createModel('nvidia/llama-3.1-nemotron-nano-vl-8b-v1', 'Llama 3.1 Nemotron Nano VL 8B', { supportsVision: true }),
        createModel('microsoft/phi-4-multimodal-instruct', 'Phi-4 Multimodal Instruct', { supportsVision: true })
      ]
    },
    zai: {
      id: 'zai',
      label: 'z.ai',
      transport: 'openai',
      color: '#111111',
      colorDark: '#E5E7EB',
      requiresApiKey: true,
      defaultBaseUrl: 'https://api.z.ai/api/paas/v4',
      defaultModel: 'glm-4.6',
      models: [
        createModel('glm-5', 'GLM-5', { supportsVision: false }),
        createModel('glm-5-turbo', 'GLM-5 Turbo', { supportsVision: false }),
        createModel('glm-4.6', 'GLM-4.6', { supportsVision: false }),
        createModel('glm-4.6v', 'GLM-4.6V', { supportsVision: true }),
        createModel('glm-4.5v', 'GLM-4.5V', { supportsVision: true }),
        createModel('glm-4.5-air', 'GLM-4.5 Air', { supportsVision: false }),
        createModel('glm-4.5-airx', 'GLM-4.5 AirX', { supportsVision: false }),
        createModel('glm-4.5-flash', 'GLM-4.5 Flash', { supportsVision: false })
      ]
    },
    zaiCoding: {
      id: 'zaiCoding',
      label: 'z.ai Coding',
      transport: 'openai',
      color: '#111111',
      colorDark: '#E5E7EB',
      requiresApiKey: true,
      defaultBaseUrl: 'https://api.z.ai/api/coding/paas/v4',
      defaultModel: 'glm-4.6v',
      models: [
        createModel('glm-5', 'GLM-5', { supportsVision: false }),
        createModel('glm-5-turbo', 'GLM-5 Turbo', { supportsVision: false }),
        createModel('glm-4.6v', 'GLM-4.6V', { supportsVision: true }),
        createModel('glm-4.5v', 'GLM-4.5V', { supportsVision: true }),
        createModel('glm-4.6', 'GLM-4.6', { supportsVision: false }),
        createModel('glm-4.5-air', 'GLM-4.5 Air', { supportsVision: false }),
        createModel('glm-4.5-airx', 'GLM-4.5 AirX', { supportsVision: false }),
        createModel('glm-4.5-flash', 'GLM-4.5 Flash', { supportsVision: false })
      ]
    },
    ollama: {
      id: 'ollama',
      label: 'Ollama',
      transport: 'openai',
      color: '#64748B',
      colorDark: '#CBD5E1',
      requiresApiKey: false,
      defaultBaseUrl: 'http://localhost:11434/v1',
      defaultModel: 'llava',
      models: [
        createModel('llava', 'LLaVA', { supportsVision: true }),
        createModel('llama3.2', 'Llama 3.2', { supportsVision: false })
      ]
    },
    litellm: {
      id: 'litellm',
      label: 'LiteLLM / Proxy',
      transport: 'openai',
      color: '#CA8A04',
      colorDark: '#FDE68A',
      requiresApiKey: true,
      defaultBaseUrl: 'https://your-litellm-gateway.example.com/v1',
      defaultModel: 'gpt-4o-mini',
      models: [
        createModel('gpt-4o-mini', 'Gateway Default', { supportsVision: true })
      ],
      note: 'Use this for Amazon Bedrock or other providers behind a LiteLLM-compatible gateway.'
    },
    vertexAnthropic: {
      id: 'vertexAnthropic',
      label: 'Google Vertex AI (Claude)',
      transport: 'vertexAnthropic',
      color: '#4285F4',
      colorDark: '#8AB4F8',
      requiresApiKey: true,
      defaultBaseUrl: 'https://global-aiplatform.googleapis.com/v1/projects/YOUR_PROJECT_ID/locations/global/publishers/anthropic',
      defaultModel: 'claude-opus-4-6',
      defaultLocation: 'global',
      models: [
        createModel('claude-opus-4-6', 'Claude Opus 4.6', { supportsVision: true }),
        createModel('claude-sonnet-4-6', 'Claude Sonnet 4.6', { supportsVision: true }),
        createModel('claude-opus-4-5', 'Claude Opus 4.5', { supportsVision: true }),
        createModel('claude-sonnet-4-5', 'Claude Sonnet 4.5', { supportsVision: true }),
        createModel('claude-haiku-4-5', 'Claude Haiku 4.5', { supportsVision: true }),
        createModel('claude-3-5-sonnet-v2@20241022', 'Claude 3.5 Sonnet v2', { supportsVision: true }),
        createModel('claude-3-5-haiku@20241022', 'Claude 3.5 Haiku', { supportsVision: true }),
        createModel('claude-3-opus@20240229', 'Claude 3 Opus', { supportsVision: true })
      ]
    }
  };

  function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function normalizeModel(model) {
    return {
      id: model.id,
      name: model.name || model.id,
      description: model.description || '',
      supportsVision: Boolean(model.supportsVision),
      category: model.category || 'chat'
    };
  }

  function mergeModels(baseModels, incomingModels) {
    const merged = [];
    const byId = new Map();

    [...(baseModels || []), ...(incomingModels || [])].forEach((model) => {
      if (!model?.id) {
        return;
      }

      const normalized = normalizeModel(model);
      const existing = byId.get(normalized.id);
      if (existing) {
        existing.name = existing.name || normalized.name;
        existing.description = existing.description || normalized.description;
        existing.supportsVision = existing.supportsVision || normalized.supportsVision;
        existing.category = existing.category || normalized.category;
        return;
      }

      byId.set(normalized.id, normalized);
      merged.push(normalized);
    });

    return merged;
  }

  function buildDefaultState() {
    const providers = {};
    Object.values(PROVIDERS).forEach((provider) => {
      const entry = {
        enabled: provider.id === 'zaiCoding',
        apiKey: '',
        baseUrl: provider.defaultBaseUrl,
        model: provider.defaultModel,
        models: deepClone(provider.models),
        lastSyncedAt: null
      };

      if (provider.defaultLocation !== undefined) {
        entry.projectId = '';
        entry.location = provider.defaultLocation;
      }

      providers[provider.id] = entry;
    });

    return {
      version: 2,
      activeProvider: 'zaiCoding',
      providers
    };
  }

  function isStorageAvailable() {
    return Boolean(globalThis.chrome?.storage?.local);
  }

  async function loadState() {
    const fallback = buildDefaultState();
    if (!isStorageAvailable()) {
      return fallback;
    }

    const stored = await chrome.storage.local.get([STORAGE_KEY, LEGACY_PROVIDER_KEY]);
    const state = stored?.[STORAGE_KEY];
    if (state?.providers) {
      return normalizeState(state);
    }

    const legacy = stored?.[LEGACY_PROVIDER_KEY];
    if (legacy?.provider) {
      const upgraded = buildDefaultState();
      Object.keys(upgraded.providers).forEach((providerId) => {
        if (legacy[providerId]) {
          upgraded.providers[providerId] = {
            ...upgraded.providers[providerId],
            ...legacy[providerId]
          };
        }
      });
      upgraded.activeProvider = legacy.provider;
      return normalizeState(upgraded);
    }

    return fallback;
  }

  function normalizeState(input) {
    const normalized = buildDefaultState();
    normalized.version = input?.version || 2;
    normalized.activeProvider = input?.activeProvider || normalized.activeProvider;

    Object.keys(normalized.providers).forEach((providerId) => {
      const existing = input?.providers?.[providerId];
      if (!existing) {
        return;
      }

      normalized.providers[providerId] = {
        ...normalized.providers[providerId],
        ...existing,
        models: Array.isArray(existing.models) && existing.models.length
          ? mergeModels(normalized.providers[providerId].models, existing.models)
          : normalized.providers[providerId].models
      };
    });

    if (!normalized.providers[normalized.activeProvider]) {
      normalized.activeProvider = 'zaiCoding';
    }

    migrateZaiProviders(normalized);

    return normalized;
  }

  function migrateZaiProviders(state) {
    const zai = state.providers.zai;
    const zaiCoding = state.providers.zaiCoding;
    if (!zai || !zaiCoding) {
      return;
    }

    const zaiBase = String(zai.baseUrl || '');
    const codingBase = String(zaiCoding.baseUrl || '');
    const zaiLooksLikeCoding = /\/coding\//.test(zaiBase);
    const codingLooksNormal = codingBase && !/\/coding\//.test(codingBase);

    if (zaiLooksLikeCoding) {
      zai.baseUrl = PROVIDERS.zai.defaultBaseUrl;
      zaiCoding.baseUrl = PROVIDERS.zaiCoding.defaultBaseUrl;

      if (zai.apiKey && !zaiCoding.apiKey) {
        zaiCoding.apiKey = zai.apiKey;
      }

      if (zai.model && (!zaiCoding.model || zaiCoding.model === PROVIDERS.zaiCoding.defaultModel)) {
        zaiCoding.model = zai.model;
      }

      state.activeProvider = 'zaiCoding';
    } else if (codingLooksNormal && /\/coding\//.test(zaiBase) === false && zaiCoding.baseUrl === PROVIDERS.zai.defaultBaseUrl) {
      zaiCoding.baseUrl = PROVIDERS.zaiCoding.defaultBaseUrl;
      state.activeProvider = 'zaiCoding';
    }
  }

  function getProviderDefinition(providerId) {
    return PROVIDERS[providerId] || PROVIDERS.zaiCoding;
  }

  function isConfiguredProvider(providerId, providerState) {
    const definition = getProviderDefinition(providerId);
    if (!providerState?.enabled) {
      return false;
    }

    if (!definition.requiresApiKey) {
      return true;
    }

    return Boolean(providerState.apiKey);
  }

  function getActiveProviderState(state) {
    return state.providers[state.activeProvider] || state.providers.zaiCoding;
  }

  function getActiveProviderDefinition(state) {
    return getProviderDefinition(state.activeProvider);
  }

  function getCurrentModel(state) {
    const providerState = getActiveProviderState(state);
    const modelId = providerState.model;
    return providerState.models.find((model) => model.id === modelId)
      || providerState.models[0]
      || { id: modelId, name: modelId, supportsVision: true };
  }

  function modelSupportsVision(state, providerId, modelId) {
    const effectiveProviderId = providerId || state.activeProvider;
    const effectiveModelId = modelId || state.providers[effectiveProviderId]?.model;
    const providerState = state.providers[effectiveProviderId];
    if (!providerState) {
      return inferVisionSupport(effectiveProviderId, effectiveModelId);
    }

    const model = providerState.models.find((entry) => entry.id === effectiveModelId);
    return model ? model.supportsVision !== false : inferVisionSupport(effectiveProviderId, effectiveModelId);
  }

  function inferVisionSupport(providerId, modelId) {
    const value = String(modelId || '').toLowerCase();
    if (!value) {
      return false;
    }

    // --- Provider-specific rules ---

    // z.ai: only explicit vision models
    if (providerId === 'zai' || providerId === 'zaiCoding') {
      return /glm-(4\.6v|4\.5v)\b/.test(value);
    }

    // Anthropic: all Claude models support vision
    if (providerId === 'anthropic' || providerId === 'vertexAnthropic') {
      return /claude/.test(value);
    }

    // OpenAI: GPT-4o/4.1/5+ support vision, codex models do not, o-series does
    if (providerId === 'openai') {
      if (/codex/.test(value)) return false;
      if (/gpt-(4o|4\.1|5)|^o[34]/.test(value)) return true;
      return false;
    }

    // Google: all Gemini models support vision
    if (providerId === 'google') {
      return /gemini/.test(value);
    }

    // xAI: only models with 'vision' or grok-3/4 (not mini), grok-2-vision
    if (providerId === 'xai') {
      if (/vision/.test(value)) return true;
      if (/grok-(3-mini|2-latest)/.test(value)) return false;
      if (/grok-[34]/.test(value)) return true;
      return false;
    }

    // Groq: mostly text-only open-source models
    if (providerId === 'groq') {
      return /(vision|vl|llava|multimodal)/.test(value);
    }

    // Mistral: only Pixtral models support vision
    if (providerId === 'mistral') {
      return /pixtral/.test(value);
    }

    // DeepSeek: no vision models
    if (providerId === 'deepseek') {
      return false;
    }

    // Perplexity: no vision models (search-focused)
    if (providerId === 'perplexity') {
      return false;
    }

    // Cerebras: no vision models (speed-focused text inference)
    if (providerId === 'cerebras') {
      return false;
    }

    // --- Generic heuristic for remaining providers ---

    // Exclude non-chat model types
    if (/(embed|whisper|tts|transcribe|moderation|rerank|audio|speech)/.test(value)) {
      return false;
    }

    // Positive vision indicators (explicit signals in model name)
    if (/(vision|vl\b|llava|multimodal|pixtral)/.test(value)) {
      return true;
    }

    // Known vision-capable model families
    if (/claude|gemini|gpt-(4o|4\.1|5)/.test(value)) {
      return true;
    }

    // Default to false for safety — text-only is the safe assumption
    return false;
  }

  function shouldKeepModel(modelId) {
    const value = String(modelId || '').toLowerCase();
    return !/(embed|moderation|whisper|tts|transcribe|image|speech|audio|rerank)/.test(value);
  }

  function getModelDescription(definition, model) {
    if (model.description) {
      return model.description;
    }

    if (model.supportsVision) {
      return `${definition.label} vision-enabled model`;
    }

    return `${definition.label} text model`;
  }

  async function fetchProviderModels(providerId, providerState) {
    const definition = getProviderDefinition(providerId);
    if (providerId === 'anthropic' || providerId === 'vertexAnthropic') {
      return deepClone(definition.models);
    }

    if (providerId === 'ollama') {
      const baseUrl = String(providerState.baseUrl || definition.defaultBaseUrl).replace(/\/v1\/?$/, '');
      const response = await fetch(`${baseUrl}/api/tags`);
      const data = await response.json();
      const models = Array.isArray(data.models) ? data.models : [];
      return mergeModels(definition.models, models
        .map((item) => item.name)
        .filter(Boolean)
        .map((id) => createModel(id, id, { supportsVision: inferVisionSupport(providerId, id) })));
    }

    const headers = {};
    if (providerState.apiKey) {
      headers.Authorization = `Bearer ${providerState.apiKey}`;
    }

    const baseUrl = String(providerState.baseUrl || definition.defaultBaseUrl).replace(/\/+$/, '');
    const modelsUrl = definition.publicModelsUrl && !providerState.apiKey
      ? definition.publicModelsUrl
      : `${baseUrl}/models`;
    const response = await fetch(modelsUrl, { headers });
    const data = await response.json();
    const models = Array.isArray(data.data) ? data.data : Array.isArray(data.models) ? data.models : [];

    return mergeModels(definition.models, models
      .map((item) => {
        const id = item.id || item.name;
        if (!id) {
          return null;
        }

        const supportsVision = Array.isArray(item?.architecture?.input_modalities)
          ? item.architecture.input_modalities.includes('image')
          : inferVisionSupport(providerId, id);

        return createModel(id, item.name || id, {
          description: item.description || '',
          supportsVision
        });
      })
      .filter((model) => model && shouldKeepModel(model.id))
      .sort((left, right) => left.id.localeCompare(right.id)));
  }

  function getEnabledProviders(state) {
    return Object.keys(state.providers)
      .filter((providerId) => isConfiguredProvider(providerId, state.providers[providerId]))
      .map((providerId) => ({
        definition: getProviderDefinition(providerId),
        state: state.providers[providerId]
      }));
  }

  function getSelectorProviders(state) {
    const providerIds = new Set(
      Object.keys(state.providers).filter((providerId) => state.providers[providerId]?.enabled)
    );

    providerIds.add(state.activeProvider);

    return Array.from(providerIds)
      .filter((providerId) => state.providers[providerId])
      .map((providerId) => ({
        definition: getProviderDefinition(providerId),
        state: state.providers[providerId]
      }));
  }

  function getLegacyProviderConfig(state) {
    const activeDefinition = getActiveProviderDefinition(state);
    const activeState = getActiveProviderState(state);
    const legacy = {
      provider: state.activeProvider
    };

    Object.keys(state.providers).forEach((providerId) => {
      legacy[providerId] = {
        baseUrl: state.providers[providerId].baseUrl,
        apiKey: state.providers[providerId].apiKey,
        model: state.providers[providerId].model
      };
    });

    legacy.active = {
      id: activeDefinition.id,
      baseUrl: activeState.baseUrl,
      apiKey: activeState.apiKey,
      model: activeState.model,
      transport: activeDefinition.transport
    };

    return legacy;
  }

  function buildFeaturePayload(state) {
    const modelOptions = [];
    getSelectorProviders(state).forEach(({ definition, state: providerState }) => {
      providerState.models.forEach((model) => {
        modelOptions.push({
          model: model.id,
          name: model.name,
          description: getModelDescription(definition, model),
          provider: definition.label,
          providerId: definition.id,
          supportsVision: model.supportsVision !== false
        });
      });
    });

    const currentModel = getCurrentModel(state);
    const brandSystemPrompt = `You are BrowserKing, an AI browser agent inside a Chrome extension. You can browse, inspect pages, use screenshots, and operate browser tools on the user's behalf.\n\nCapabilities:\n- Take screenshots of the current page\n- Click, type, scroll, and navigate web pages\n- Read page content and extract information\n- Execute JavaScript on pages\n- Open new tabs and switch between them\n- Help users complete browser tasks efficiently and safely\n\nGuidelines:\n- Be helpful, honest, and careful\n- Take a screenshot before acting on unfamiliar pages when visual context matters\n- Explain your intended next step before taking actions\n- Protect sensitive information and do not submit private data unless the user explicitly instructs you\n- Use {{currentDateTime}} as the current date/time reference\n- The current model is {{modelName}}`;

    return {
      payload: {
        features: {
          chrome_ext_models: {
            value: {
              default: currentModel.id,
              options: modelOptions,
              models: modelOptions
            },
            on: true
          },
          chrome_ext_model_selector: {
            value: {
              default: currentModel.id,
              options: modelOptions.map((option) => ({
                value: option.model,
                label: option.name,
                description: option.description
              }))
            },
            on: true
          },
          chrome_ext_announcement: { value: {}, on: true },
          chrome_ext_version_info: { value: {}, on: true },
          chrome_ext_flash_enabled: { value: false, on: true },
          chrome_ext_downloads: { value: false, on: true },
          chrome_ext_system_prompt: {
            value: { systemPrompt: brandSystemPrompt },
            on: true
          },
          chrome_ext_skip_perms_system_prompt: {
            value: {
              skipPermissionsSystemPrompt: `${brandSystemPrompt}\n\nYou have been granted permission to act without asking for confirmation on each action.`
            },
            on: true
          },
          chrome_ext_multiple_tabs_system_prompt: { value: {}, on: true },
          chrome_ext_explicit_permissions_prompt: { value: {}, on: true },
          chrome_ext_tool_usage_prompt: { value: {}, on: true },
          chrome_ext_custom_tool_prompts: { value: {}, on: true },
          chrome_ext_purl_config: { value: null, on: true },
          chrome_ext_purl_prompt: { value: '', on: true },
          chrome_ext_oauth_refresh: { value: {}, on: true }
        }
      },
      timestamp: Date.now()
    };
  }

  async function syncStateToChrome(state) {
    if (!isStorageAvailable()) {
      return state;
    }

    const activeDefinition = getActiveProviderDefinition(state);
    const activeState = getActiveProviderState(state);
    const currentModel = getCurrentModel(state);

    await chrome.storage.local.set({
      [STORAGE_KEY]: state,
      [LEGACY_PROVIDER_KEY]: getLegacyProviderConfig(state),
      browserKingBrand: BRAND,
      browserKingActiveProvider: {
        id: activeDefinition.id,
        label: activeDefinition.label,
        color: activeDefinition.color,
        colorDark: activeDefinition.colorDark,
        transport: activeDefinition.transport
      },
      anthropicApiKey: activeState.apiKey || 'browserking-key',
      selectedModel: currentModel.id,
      selectedModelQuickMode: currentModel.id,
      accessToken: 'browserking-access-token',
      refreshToken: 'browserking-refresh-token',
      tokenExpiry: Date.now() + 365 * 24 * 60 * 60 * 1000,
      lastAuthFailureReason: undefined,
      browserControlPermissionAccepted: true,
      announcementDismissed: 'all',
      lastPermissionModePreference: 'ask',
      features: buildFeaturePayload(state)
    });

    return state;
  }

  async function saveState(partialState) {
    const normalized = normalizeState(partialState);
    return syncStateToChrome(normalized);
  }

  async function updateState(mutator) {
    const current = await loadState();
    const draft = normalizeState(deepClone(current));
    await mutator(draft);
    return saveState(draft);
  }

  function getProviderTheme(providerId) {
    const definition = getProviderDefinition(providerId);
    return {
      color: definition.color,
      colorDark: definition.colorDark
    };
  }

  globalThis.BrowserKingRegistry = {
    BRAND,
    PROVIDERS,
    STORAGE_KEY,
    buildDefaultState,
    loadState,
    saveState,
    updateState,
    fetchProviderModels,
    getEnabledProviders,
    getSelectorProviders,
    getProviderDefinition,
    getActiveProviderDefinition,
    getActiveProviderState,
    getCurrentModel,
    modelSupportsVision,
    getLegacyProviderConfig,
    buildFeaturePayload,
    syncStateToChrome,
    getProviderTheme,
    isConfiguredProvider,
    mergeModels
  };
})();
