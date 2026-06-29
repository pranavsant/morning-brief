/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ANTHROPIC_API_KEY: string;
  readonly VITE_NEWS_API_KEY: string;
  readonly VITE_CLAUDE_MODEL?: string;
  readonly VITE_MAX_ARTICLES_PER_CATEGORY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
