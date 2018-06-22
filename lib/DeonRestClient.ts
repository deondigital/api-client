import { DeonApi, ContractsApi, DeclarationsApi, CslApi, InfoApi } from './DeonApi';
import { InstantiationInput, ExpressionInput, DeclarationInput, Event, Tag } from './DeonData';
import { HttpClient, Response } from './HttpClient';

/**
 * Constructs a Deon REST client.
 */
class DeonRestClient implements DeonApi {
  private http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  static create = (
    fetch: (url: any, init: any) => Promise<Response>,
    serverUrl: string = '',
    hook: (r: Response) => PromiseLike<Response> | Response = r => r,
  ) => new DeonRestClient(new HttpClient(fetch, hook, serverUrl))

  contracts: ContractsApi = {
    getAll: () => this.http.get('/contracts'),

    get: (id: string) => this.http.get(`/contracts/${id}`),

    tree: (id: string) => this.http.get(`/contracts/${id}/tree`),

    src: (id: string, simplified: boolean) => {
      const url = simplified ? `/contracts/${id}/src/?simplified=true` : `/contracts/${id}/src`;
      return this.http.get(url);
    },

    nextEvents: (id: string) => this.http.get(`/contracts/${id}/next-events`),

    instantiate: (instantiateInput: InstantiationInput) =>
      this.http.post('/contracts', instantiateInput),

    applyEvent: (id: string, event: Event, tag?: Tag) => {
      if (tag) return this.http.post(`/contracts/${id}/${tag}/events`, event);
      return this.http.post(`/contracts/${id}/events`, event);
    },

    report: (expressionInput: ExpressionInput) =>
      this.http.post('/contracts/report', expressionInput),

    reportOnContract: (id: string, expressionInput: ExpressionInput) =>
      this.http.post(`/contracts/${id}/report`, expressionInput),
  };

  declarations: DeclarationsApi = {
    getAll: () => this.http.get('/declarations'),

    get: (id: string) => this.http.get(`/declarations/${id}`),

    add: (i: DeclarationInput) => this.http.post('/declarations', i),

    ontology: (id: string) => this.http.get(`/declarations/${id}/ontology`),
  };

  csl: CslApi = {
    check: (i: ExpressionInput) => this.http.post('/csl/check', i),

    checkExpression: (i: ExpressionInput, id?: string) => {
      if (id) return this.http.post(`/csl/check-expression/${id}`, i);
      return this.http.post('/csl/check-expression', i);
    },

  };

  info: InfoApi = {
    get: () => this.http.get('/node-info'),
  };
}

export { DeonRestClient };
