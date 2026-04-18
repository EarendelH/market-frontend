import { useAuthStore } from "@/stores/auth-store";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

type QueryValue = string | number | boolean | null | undefined;

interface RequestOptions extends Omit<RequestInit, "body"> {
  params?: Record<string, QueryValue>;
  data?: BodyInit | Record<string, unknown> | unknown[] | null;
}

type RequestData = RequestOptions["data"];

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  error: {
    code: string;
    message: string;
  } | null;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { params, headers, data, ...rest } = options;

    let url = `${this.baseURL}${endpoint}`;

    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          searchParams.set(key, String(value));
        }
      });
      url += `?${searchParams.toString()}`;
    }

    const token = useAuthStore.getState().token;
    const requestHeaders = new Headers(headers);
    const requestBody =
      data instanceof FormData
        ? data
        : data !== undefined && data !== null
          ? JSON.stringify(data)
          : undefined;

    if (!(requestBody instanceof FormData)) {
      requestHeaders.set("Content-Type", "application/json");
    }
    requestHeaders.set("Accept", "application/json");

    if (token) {
      requestHeaders.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(url, {
      headers: requestHeaders,
      body: requestBody,
      ...rest,
    });

    const isJsonResponse = response.headers
      .get("content-type")
      ?.includes("application/json");
    const payload = isJsonResponse ? await response.json().catch(() => null) : null;

    if (!response.ok) {
      if (response.status === 401 && typeof window !== "undefined") {
        useAuthStore.getState().clearAuth();
      }

      const envelope = payload as Partial<ApiEnvelope<unknown>> | null;
      const errorMessage =
        envelope?.error?.message ??
        (payload &&
        typeof payload === "object" &&
        "message" in payload &&
        typeof payload.message === "string"
          ? payload.message
          : "Request failed");
      const errorCode = envelope?.error?.code;

      throw new ApiError(response.status, errorMessage, errorCode);
    }

    if (!isJsonResponse) {
      return undefined as T;
    }

    if (
      payload &&
      typeof payload === "object" &&
      "success" in payload &&
      "data" in payload
    ) {
      return (payload as ApiEnvelope<T>).data;
    }

    return payload as T;
  }

  get<T>(endpoint: string, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  post<T>(endpoint: string, data?: RequestData, options?: RequestOptions) {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      data,
    });
  }

  put<T>(endpoint: string, data?: RequestData, options?: RequestOptions) {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      data,
    });
  }

  patch<T>(endpoint: string, data?: RequestData, options?: RequestOptions) {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      data,
    });
  }

  delete<T>(endpoint: string, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }

  async upload(file: File): Promise<{ url: string; filename: string }> {
    const formData = new FormData();
    formData.append("file", file);
    return this.post<{ url: string; filename: string }>("/upload", formData);
  }
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
