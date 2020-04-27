export type Response = any;
export type RequestInit = any;
export type Request = any;

export class HttpClient {
  constructor(
    private fetch : (url: string | Request, init?: RequestInit) => Promise<Response>,
    private hook: (r: Promise<Response>) => Promise<Response>,
    private serverUrl: string,
    private identityHeader: string = '',
  ) {}

  private idHeader = this.identityHeader !== ''
    ? { 'Deon-Digital-Identity': this.identityHeader }
    : {};

  get = (url: string): Promise<Response> => this.hook(this.fetch(this.serverUrl + url, {
    headers: { ...this.idHeader },
  }))

  post = (url: string, data: object): Promise<Response> =>
    this.hook(this.fetch(this.serverUrl + url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.idHeader },
      body: JSON.stringify(data),
    }))
}
