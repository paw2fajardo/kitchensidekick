import {
  MealieClientConfig,
  MealiePaginationResponse,
  MealieRecipe,
  MealieRecipeSummary,
} from './types.js';

export class MealieApiError extends Error {
  public readonly status?: number;
  public readonly code: string;

  constructor(message: string, status?: number, code: string = 'MEALIE_API_ERROR') {
    super(message);
    this.name = 'MealieApiError';
    this.status = status;
    this.code = code;
  }
}

export class MealieClient {
  private readonly baseUrl: string;
  private readonly apiToken?: string;
  private readonly timeoutMs: number;
  private readonly fetchFn: typeof fetch;

  constructor(config: MealieClientConfig, fetchFn: typeof fetch = fetch) {
    // Trim trailing slash from baseUrl
    this.baseUrl = config.baseUrl.replace(/\/+$/, '');
    this.apiToken = config.apiToken;
    this.timeoutMs = config.timeoutMs ?? 10000;
    this.fetchFn = fetchFn;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.apiToken) {
      headers['Authorization'] = `Bearer ${this.apiToken}`;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await this.fetchFn(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      if (!response.ok) {
        let errorBody: string;
        try {
          errorBody = await response.text();
        } catch {
          errorBody = response.statusText;
        }

        if (response.status === 401 || response.status === 403) {
          throw new MealieApiError(`Authentication failed: ${response.status}`, response.status, 'AUTH_ERROR');
        }
        if (response.status === 404) {
          throw new MealieApiError(`Resource not found at ${endpoint}`, 404, 'NOT_FOUND');
        }
        throw new MealieApiError(
          `Mealie API responded with HTTP ${response.status}: ${errorBody}`,
          response.status,
          'HTTP_ERROR'
        );
      }

      const data = await response.json();
      return data as T;
    } catch (err: any) {
      if (err instanceof MealieApiError) {
        throw err;
      }
      if (err.name === 'AbortError') {
        throw new MealieApiError(`Mealie request timed out after ${this.timeoutMs}ms`, undefined, 'TIMEOUT');
      }
      throw new MealieApiError(`Connection failed: ${err.message || String(err)}`, undefined, 'NETWORK_ERROR');
    } finally {
      clearTimeout(timer);
    }
  }

  public async getRecipes(page: number = 1, perPage: number = 50): Promise<MealiePaginationResponse<MealieRecipeSummary>> {
    return this.request<MealiePaginationResponse<MealieRecipeSummary>>(
      `/api/recipes?page=${encodeURIComponent(page)}&per_page=${encodeURIComponent(perPage)}`
    );
  }

  public async getRecipeBySlug(slug: string): Promise<MealieRecipe> {
    if (!slug || !slug.trim()) {
      throw new MealieApiError('Recipe slug must not be empty', 400, 'INVALID_ARGUMENT');
    }
    return this.request<MealieRecipe>(`/api/recipes/${encodeURIComponent(slug.trim())}`);
  }
}
