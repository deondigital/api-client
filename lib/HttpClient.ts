import { RestResponse } from './DeonApi';

export type Response = any;
export type RequestInit = any;
export type Request = any;

export class HttpClient {
  private fetch: (url: string | Request, init?: RequestInit) => Promise<Response>;
  private hook: (r: Response) => PromiseLike<Response> | Response;
  private serverUrl: string;

  constructor(
    fetch : (url: string | Request, init?: RequestInit) => Promise<Response>,
    hook: (r: Response) => PromiseLike<Response> | Response,
    serverUrl: string,
  ) {
    this.fetch = fetch;
    this.hook = hook;
    this.serverUrl = serverUrl;
  }

  get = <TOk, TErr>(url: string): Promise<RestResponse<TOk, TErr>> =>
    this.fetchRest(this.serverUrl + url)

  post = <TOk, TErr>(url: string, data: object): Promise<RestResponse<TOk, TErr>> =>
    this.fetchRest(this.serverUrl + url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

  private fetchRest = <TOk, TErr>(
    url: string,
    data?: RequestInit,
  ): Promise<RestResponse<TOk, TErr>> =>
    this.fetch(url, data).then(this.hook).then(r => this.toRestResponse<TOk, TErr>(r))

  private toRestResponse = async <TOk, TErr>(r: Response): Promise<RestResponse<TOk, TErr>> => {
    const hasData = r.status !== 204 && r.headers.get('content-length') !== '0';

    if (r.ok) {
      if (hasData) {
        const data: TOk = await r.json();
        return { data, ok: true, statusCode: r.status };
      }
      return { ok: true, statusCode: r.status };
    }
    if (hasData) {
      const data: TErr = await r.json();
      return { data, ok: false, statusCode: r.status };
    }
    return { ok: false, statusCode: r.status };
  }
}
