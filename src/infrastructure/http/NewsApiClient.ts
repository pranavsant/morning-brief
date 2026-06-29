/**
 * NewsApiClient — low-level HTTP client for NewsAPI.org.
 *
 * Responsible only for making raw HTTP calls and returning typed
 * response shapes. No domain logic here.
 *
 * Exposes:
 *   • getTopHeadlines()  — /v2/top-headlines  (category + country filter)
 *   • searchByCategory() — /v2/everything     (keyword search within a topic)
 *
 * All failures are thrown as {@link NewsApiError} so callers can branch
 * on typed conditions (auth failure, rate-limit, etc.) without parsing
 * free-form strings.
 *
 * Layer: infrastructure.
 */

import { NewsApiError } from './NewsApiError';

// ── Shared raw types ─────────────────────────────────────────────────────────

export interface NewsApiArticleRaw {
  source:      { id: string | null; name: string };
  author:      string | null;
  title:       string;
  description: string | null;
  url:         string;
  urlToImage:  string | null;
  publishedAt: string;
  content:     string | null;
}

// ── Response shapes ──────────────────────────────────────────────────────────

export interface NewsApiTopHeadlinesResponse {
  status:       string;
  totalResults: number;
  articles:     NewsApiArticleRaw[];
}

export interface NewsApiEverythingResponse {
  status:       string;
  totalResults: number;
  articles:     NewsApiArticleRaw[];
}

/** Shape of a NewsAPI error body (status === "error"). */
interface NewsApiErrorBody {
  status:  string;
  code:    string;
  message: string;
}

// ── Parameter types ──────────────────────────────────────────────────────────

export interface TopHeadlinesParams {
  /** NewsAPI category, e.g. "technology". */
  category: string;
  /** ISO 3166-1 alpha-2 country code, e.g. "us". */
  country:  string;
  /** Maximum number of results (1–100). */
  pageSize: number;
}

export interface SearchByCategoryParams {
  /**
   * The topic / category keyword to search for (e.g. "technology").
   * Sent as the `q` query parameter to /v2/everything.
   */
  category: string;
  /** Maximum number of results (1–100). */
  pageSize: number;
  /**
   * ISO 639-1 language code (e.g. "en").
   * Defaults to "en" when omitted.
   */
  language?: string;
  /**
   * Sort order for results.
   * NewsAPI accepts "relevancy" | "popularity" | "publishedAt".
   * Defaults to "publishedAt" when omitted.
   */
  sortBy?: 'relevancy' | 'popularity' | 'publishedAt';
}

// ── Client ───────────────────────────────────────────────────────────────────

export class NewsApiClient {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://newsapi.org/v2';

  constructor(apiKey: string) {
    if (!apiKey || apiKey.trim().length === 0) {
      throw new NewsApiError('NewsApiClient: apiKey is required.', 0, 'apiKeyMissing');
    }
    this.apiKey = apiKey.trim();
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  /**
   * Fetch top headlines filtered by category and country.
   * Wraps the `/v2/top-headlines` endpoint.
   */
  async getTopHeadlines(
    params: TopHeadlinesParams,
  ): Promise<NewsApiTopHeadlinesResponse> {
    const url = new URL(`${this.baseUrl}/top-headlines`);
    url.searchParams.set('apiKey',   this.apiKey);
    url.searchParams.set('category', params.category);
    url.searchParams.set('country',  params.country);
    url.searchParams.set('pageSize', String(params.pageSize));

    const data = await this.request<NewsApiTopHeadlinesResponse>(url);
    return data;
  }

  /**
   * Search articles by category keyword across all sources.
   * Wraps the `/v2/everything` endpoint.
   *
   * Use this when you need broader coverage beyond top-headlines, or when
   * you want to filter by language / sort order.
   */
  async searchByCategory(
    params: SearchByCategoryParams,
  ): Promise<NewsApiEverythingResponse> {
    const url = new URL(`${this.baseUrl}/everything`);
    url.searchParams.set('apiKey',   this.apiKey);
    url.searchParams.set('q',        params.category);
    url.searchParams.set('pageSize', String(params.pageSize));
    url.searchParams.set('language', params.language ?? 'en');
    url.searchParams.set('sortBy',   params.sortBy   ?? 'publishedAt');

    const data = await this.request<NewsApiEverythingResponse>(url);
    return data;
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  /**
   * Execute a fetch request, parse the JSON body, and normalise all
   * failure modes into {@link NewsApiError}.
   */
  private async request<T extends { status: string }>(url: URL): Promise<T> {
    let response: Response;

    try {
      response = await fetch(url.toString());
    } catch (networkErr) {
      throw new NewsApiError(
        `NewsAPI network error: ${networkErr instanceof Error ? networkErr.message : String(networkErr)}`,
        0,
      );
    }

    let body: unknown;
    try {
      body = await response.json();
    } catch {
      throw new NewsApiError(
        `NewsAPI responded with ${response.status} and a non-JSON body.`,
        response.status,
      );
    }

    // NewsAPI returns status 200 even for some error conditions — check the
    // body's "status" field before trusting the payload.
    if (!response.ok || (body as { status?: string }).status === 'error') {
      const errorBody = body as Partial<NewsApiErrorBody>;
      throw new NewsApiError(
        errorBody.message ??
          `NewsAPI responded with HTTP ${response.status}.`,
        response.status,
        errorBody.code,
      );
    }

    return body as T;
  }
}
