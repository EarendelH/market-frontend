const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number>;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: { code: string; message: string } | null;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, headers, ...rest } = options;
    let url = `${this.baseURL}${endpoint}`;
    
    if (params) {
      const searchParams = new URLSearchParams(
        Object.entries(params).map(([key, value]) => [key, String(value)])
      );
      url += `?${searchParams.toString()}`;
    }

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      ...rest,
    });

    const json: ApiResponse<T> = await response.json().catch(() => ({}));

    if (!response.ok || !json.success) {
      throw new ApiError(response.status, json.error?.message ?? "请求失败", json.error?.code);
    }

    return json.data;
  }

  get<T>(endpoint: string, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  post<T>(endpoint: string, data?: unknown, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method: "POST", body: data ? JSON.stringify(data) : undefined });
  }

  patch<T>(endpoint: string, data?: unknown, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method: "PATCH", body: data ? JSON.stringify(data) : undefined });
  }

  delete<T>(endpoint: string, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

export class ApiError extends Error {
  constructor(public status: number, message: string, public code?: string) {
    super(message);
    this.name = "ApiError";
  }
}

export const apiClient = new ApiClient(API_BASE_URL);