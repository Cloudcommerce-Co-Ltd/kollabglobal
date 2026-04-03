import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getAIModel, isAIConfigured } from '../ai';

vi.mock('@ai-sdk/google', () => ({
  google: vi.fn((model) => `mock-google-${model}`),
}));

vi.mock('@openrouter/ai-sdk-provider', () => ({
  createOpenRouter: vi.fn(() => {
    return vi.fn((model) => `mock-openrouter-${model}`);
  }),
}));

describe('ai utility', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('getAIModel', () => {
    it('returns openrouter model by default if AI_PROVIDER is not google', () => {
      delete process.env.AI_PROVIDER;
      const model = getAIModel();
      expect(model).toBe('mock-openrouter-google/gemini-2.5-flash-lite');
    });

    it('returns openrouter model with specified modelId', () => {
      delete process.env.AI_PROVIDER;
      const model = getAIModel('custom-model');
      expect(model).toBe('mock-openrouter-custom-model');
    });

    it('returns google model if AI_PROVIDER is google', () => {
      process.env.AI_PROVIDER = 'google';
      const model = getAIModel();
      expect(model).toBe('mock-google-gemini-2.5-flash-lite');
    });

    it('returns google model with specified modelId if AI_PROVIDER is google', () => {
      process.env.AI_PROVIDER = 'google';
      const model = getAIModel('custom-google-model');
      expect(model).toBe('mock-google-custom-google-model');
    });
  });

  describe('isAIConfigured', () => {
    it('returns true if provider is google and GOOGLE_GENERATIVE_AI_API_KEY is defined', () => {
      process.env.AI_PROVIDER = 'google';
      process.env.GOOGLE_GENERATIVE_AI_API_KEY = 'test-key';
      expect(isAIConfigured()).toBe(true);
    });

    it('returns false if provider is google and GOOGLE_GENERATIVE_AI_API_KEY is missing', () => {
      process.env.AI_PROVIDER = 'google';
      delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;
      expect(isAIConfigured()).toBe(false);
    });

    it('returns true if provider is openrouter (default) and OPENROUTER_API_KEY is defined', () => {
      delete process.env.AI_PROVIDER;
      process.env.OPENROUTER_API_KEY = 'test-key';
      expect(isAIConfigured()).toBe(true);
    });

    it('returns false if provider is openrouter (default) and OPENROUTER_API_KEY is missing', () => {
      delete process.env.AI_PROVIDER;
      delete process.env.OPENROUTER_API_KEY;
      expect(isAIConfigured()).toBe(false);
    });
  });
});
