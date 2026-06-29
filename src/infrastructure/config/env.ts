/**
 * env — typed access to environment variables.
 *
 * Per the infrastructure layer rules, environment config lives here and
 * nowhere else. Reading process.env / import.meta.env outside this layer
 * is forbidden.
 *
 * Layer: infrastructure.
 */

interface AppEnv {
  anthropicApiKey: string;
  newsApiKey:      string;
  claudeModel:     string;
  maxArticlesPerCategory: number;
}

function required(value: string | undefined, name: string): string {
  if (!value || value.trim().length === 0) {
    throw new Error(
      `Missing required environment variable "${name}". ` +
        'Copy .env.example to .env.local and fill it in.',
    );
  }
  return value.trim();
}

export function loadEnv(): AppEnv {
  const env = import.meta.env;

  return {
    anthropicApiKey: required(env.VITE_ANTHROPIC_API_KEY, 'VITE_ANTHROPIC_API_KEY'),
    newsApiKey:      required(env.VITE_NEWS_API_KEY, 'VITE_NEWS_API_KEY'),
    claudeModel:     env.VITE_CLAUDE_MODEL?.trim() || 'claude-3-5-haiku-20241022',
    maxArticlesPerCategory: Number(env.VITE_MAX_ARTICLES_PER_CATEGORY ?? '5'),
  };
}
