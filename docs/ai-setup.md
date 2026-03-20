# AI Setup

The app uses the [Vercel AI SDK](https://sdk.vercel.ai) with a swappable provider — OpenRouter for dev/testing, Google AI (Gemini) for production. Switching is a single env var change.

---

## Environment Variables

Add these to your `.env.local`:

```bash
# Which provider to use: "openrouter" (default) or "google"
AI_PROVIDER=openrouter

# OpenRouter — for dev/testing
OPENROUTER_API_KEY=sk-or-...

# Google AI — for production (Gemini 2.5 Flash Lite)
# GOOGLE_GENERATIVE_AI_API_KEY=...
```

---

## Dev Setup (OpenRouter)

OpenRouter lets you access Gemini models without a Google Cloud account. It's the recommended setup for local development.

1. Go to [openrouter.ai](https://openrouter.ai) and create an account
2. Navigate to **Keys** → **Create Key**
3. Copy the key (starts with `sk-or-`)
4. Add to `.env.local`:
   ```bash
   AI_PROVIDER=openrouter
   OPENROUTER_API_KEY=sk-or-your-key-here
   ```

The app uses `google/gemini-2.5-flash-lite` via OpenRouter by default — same model as production.

---

## Production Setup (Google AI)

1. Go to [aistudio.google.com](https://aistudio.google.com) → **Get API Key**
2. Create a key in a Google Cloud project
3. Set in your production environment:
   ```bash
   AI_PROVIDER=google
   GOOGLE_GENERATIVE_AI_API_KEY=your-key-here
   ```

---

## What happens without a key

Both AI endpoints gracefully degrade — no errors, no crashes:

| Endpoint | Behaviour without key |
|---|---|
| `POST /api/ai/fill-brief` | Returns hardcoded mock brief in Thai |
| `POST /api/ai/translate` | Returns the input fields unchanged |

This means the UI is fully testable without any API key configured.

---

## How the provider is selected

`src/lib/ai.ts` — `getAIModel()` reads `AI_PROVIDER` at runtime:

```
AI_PROVIDER=openrouter  →  @openrouter/ai-sdk-provider  (google/gemini-2.5-flash-lite)
AI_PROVIDER=google      →  @ai-sdk/google               (gemini-2.5-flash-lite)
```

To swap providers, change one env var and restart the server. No code changes needed.

---

## AI-powered features

| Feature | Endpoint | Trigger |
|---|---|---|
| Fill brief with AI | `POST /api/ai/fill-brief` | "Fill with AI" button on `/campaigns/[id]/brief/new` |
| Translate brief | `POST /api/ai/translate` | "Translate" button on `/campaigns/[id]/brief/new` |

Both are server-side only — no client-side AI calls.
