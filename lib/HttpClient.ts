export type Response = any;
export type RequestInit = any;
export type Request = any;

export class HttpClient {
  constructor(
    private fetch : (url: string | Request, init?: RequestInit) => Promise<Response>,
    private hook: (r: Promise<Response>) => Promise<Response>,
    private serverUrl: string,
  ) {}

  get = (url: string): Promise<Response> => this.hook(this.fetch(this.serverUrl + url));

  post = (url: string, data: object): Promise<Response> =>
    this.hook(this.fetch(this.serverUrl + url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }))
}
