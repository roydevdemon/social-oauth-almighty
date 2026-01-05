import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { HttpMethod } from '../types/provider.types';

/**
 * HTTP client wrapper for making OAuth requests
 */
export class HttpClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      timeout: 10000,
      validateStatus: (status) => status >= 200 && status < 500,
    });
  }

  /**
   * Creates Basic Authentication header
   * @param username - Username or client ID
   * @param password - Password or client secret
   * @returns Authorization header value
   */
  private createBasicAuth(username: string, password: string): string {
    const credentials = `${username}:${password}`;
    const encoded = Buffer.from(credentials).toString('base64');
    return `Basic ${encoded}`;
  }

  /**
   * Makes an HTTP request
   * @param method - HTTP method
   * @param url - Request URL
   * @param options - Request options
   * @returns Response data
   */
  async request<T = any>(
    method: HttpMethod,
    url: string,
    options?: {
      headers?: Record<string, string>;
      params?: Record<string, any>;
      data?: Record<string, any>;
      auth?: {
        username: string;
        password: string;
      };
    },
  ): Promise<T> {
    const config: AxiosRequestConfig = {
      method,
      url,
      headers: options?.headers || {},
      params: options?.params,
      data: options?.data,
    };

    // Add Basic Authentication if provided
    if (options?.auth) {
      config.headers = {
        ...config.headers,
        Authorization: this.createBasicAuth(options.auth.username, options.auth.password),
      };
    }

    // For POST requests with form data
    if (method === 'POST' && options?.data) {
      const contentType = options?.headers?.['Content-Type'];
      if (contentType?.includes('application/x-www-form-urlencoded') || !contentType) {
        config.data = new URLSearchParams(options.data).toString();
        config.headers = {
          ...config.headers,
          'Content-Type': 'application/x-www-form-urlencoded',
        };
      }
    }

    try {
      const response: AxiosResponse<T> = await this.axiosInstance.request(config);

      if (response.status >= 400) {
        throw new Error(`HTTP ${response.status}: ${JSON.stringify(response.data)}`);
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Request failed: ${error.message} - ${JSON.stringify(error.response?.data)}`,
        );
      }
      throw error;
    }
  }

  /**
   * Makes a GET request
   */
  async get<T = any>(
    url: string,
    options?: {
      headers?: Record<string, string>;
      params?: Record<string, any>;
    },
  ): Promise<T> {
    return this.request<T>('GET', url, options);
  }

  /**
   * Makes a POST request
   */
  async post<T = any>(
    url: string,
    data?: Record<string, any>,
    options?: {
      headers?: Record<string, string>;
      auth?: {
        username: string;
        password: string;
      };
    },
  ): Promise<T> {
    return this.request<T>('POST', url, { ...options, data });
  }

  /**
   * Makes a PUT request
   */
  async put<T = any>(
    url: string,
    data?: Record<string, any>,
    options?: {
      headers?: Record<string, string>;
    },
  ): Promise<T> {
    return this.request<T>('PUT', url, { ...options, data });
  }

  /**
   * Makes a PATCH request
   */
  async patch<T = any>(
    url: string,
    data?: Record<string, any>,
    options?: {
      headers?: Record<string, string>;
    },
  ): Promise<T> {
    return this.request<T>('PATCH', url, { ...options, data });
  }

  /**
   * Makes a DELETE request
   */
  async delete<T = any>(
    url: string,
    options?: {
      headers?: Record<string, string>;
      data?: Record<string, any>;
      auth?: {
        username: string;
        password: string;
      };
    },
  ): Promise<T> {
    return this.request<T>('DELETE', url, options);
  }
}
