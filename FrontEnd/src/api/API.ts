import appStore from "app/mobxStore/AppStore";

interface RequestOptions {
  headers?: { [key: string]: string };
  body?: any;
}

class FetchAPI {
  private baseUrl: string;
  private loading: boolean;
  private error: string | null;
  private authToken: string | null;
  private navigations: any[];

  constructor(baseUrl: string, authToken: string | null = null) {
    this.baseUrl = baseUrl;
    this.loading = false;
    this.error = null;
    this.authToken = authToken;
  }

  private async request(
    url: string,
    method: string,
    options?: RequestOptions
  ): Promise<any> {
    try {
      appStore.setLoading(true);
      appStore.loading = true;
      this.error = null;

      const headers: { [key: string]: string } = {
        "Content-Type": "application/json",
        ...options?.headers,
      };

      if (this.authToken) {
        headers["Authorization"] = `Bearer ${this.authToken}`;
      }

      const response = await fetch(`${this.baseUrl}${url}`, {
        method,
        headers,
        body: JSON.stringify(options?.body),
      });

      const data = await response.json();
      this.loading = false;
      appStore.setLoading(false);
      if (!response.ok) {
        this.error = data.message || "Something went wrong.";
        throw new Error(this.error);
      }

      return data;
    } catch (error) {
      this.loading = false;
      this.error = error.message || "Something went wrong.";
      throw error;
    }
  }

  public async get(url: string, options?: RequestOptions): Promise<any> {
    return this.request(url, "GET", options);
  }

  public async post(url: string, options?: RequestOptions): Promise<any> {
    return this.request(url, "POST", options);
  }

  public async put(url: string, options?: RequestOptions): Promise<any> {
    return this.request(url, "PUT", options);
  }

  public async delete(url: string, options?: RequestOptions): Promise<any> {
    return this.request(url, "DELETE", options);
  }

  public isLoading(): boolean {
    return this.loading;
  }

  public getError(): string | null {
    return this.error;
  }

  public setAuthToken(token: string | null): void {
    this.authToken = token;
  }
  public setNavigations(navigations: []): void {
    this.navigations = navigations;
  }
}
//export const api = new FetchAPI("https://api.gradwalk.us/api/");
export const api = new FetchAPI("http://api.jlisting.org/api/");
//export const api = new FetchAPI("http://localhost:5200/api/");
//export const api = new FetchAPI("http://192.168.1.4:5200/api/");
