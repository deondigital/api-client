import { ExternalObject } from './ExternalObject';

export type Response = any;
export type RequestInit = any;
export type Request = any;

export class HttpClient {
  constructor(
    private fetch : (url: string | Request, init?: RequestInit) => Promise<Response>,
    private hook: (r: Promise<Response>) => Promise<Response>,
    private serverUrl: string,
    public identity?: ExternalObject,
  ) {}

  private idHeader = this.identity != null
    ? { 'Deon-Digital-Identity': encodeURIComponent(JSON.stringify(this.identity)) }
    : {};

  get = (url: string): Promise<Response> => this.hook(this.fetch(this.serverUrl + url, {
    headers: { ...this.idHeader },
  }))

  post = (url: string, data?: object): Promise<Response> =>
    this.hook(this.fetch(this.serverUrl + url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.idHeader },
      body: data == null ? null : JSON.stringify(data),
    }))
}
