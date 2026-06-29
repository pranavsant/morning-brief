/**
 * NewsApiClient — low-level HTTP client for NewsAPI.org.
 *
 * Responsible only for making raw HTTP calls and returning typed
 * response shapes. No domain logic here.
 *
 * Layer: infrastructure.
 */

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

export interface NewsApiTopHeadlinesResponse {
  status:       string;
  totalResults: number;
  articles:     NewsApiArticleRaw[];
}

export class NewsApiClient {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://newsapi.org/v2';

  constructor(apiKey: string) {
    if (!apiKey || apiKey.trim().length === 0) {
      throw new Error('NewsApiClient: apiKey is required.');
    }
    this.apiKey = apiKey.trim();
  }

  async getTopHeadlines(params: {
    category: string;
    country:  string;
    pageSize: number;
  }): Promise<NewsApiTopHeadlinesResponse> {
    const url = new URL(`${this.baseUrl}/top-headlines`);
    url.searchParams.set('apiKey',   this.apiKey);
    url.searchParams.set('category', params.category);
    url.searchParams.set('country',  params.country);
    url.searchParams.set('pageSize', String(params.pageSize));

    const response = await fetch(url.toString());

    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `NewsAPI responded with ${response.status}: ${body}`,
      );
    }

    const data = (await response.json()) as NewsApiTopHeadlinesResponse;

    if (data.status !== 'ok') {
      throw new Error(`NewsAPI returned status "${data.status}".`);
    }

    return data;
  }
}
