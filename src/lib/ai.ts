// AI service — credentials pending from company
// All functions are no-ops until AI_API_KEY is configured

const AI_API_KEY = process.env.AI_API_KEY;

export const isAIConfigured = (): boolean => !!AI_API_KEY;
