import {
  DeonApi,
  ContractsApi,
  DeclarationsApi,
  CslApi,
  InfoApi,
  NotFoundError,
  BadRequestError,
  ResponseError,
  isCheckErrors,
  CheckErrors,
} from './DeonApi';
import {
  InstantiationInput,
  CheckExpressionInput,
  EvaluateExpressionInput,
  DeclarationInput,
  Event,
  Tag,
  ContractIdValue,
} from './DeonData';
import { HttpClient, Response } from './HttpClient';

const throwIfNotFound = (r: Response, data: any) => {
  if (r.status === 404 && data && data.message) {
    throw new NotFoundError(data.message);
  }
};

const errorsMessage = (errors: CheckErrors[]): string => {
  const message = (checkErrors: CheckErrors): string => {
    const extract = (o: { msg: string }[]): string =>
      o.map(o => o.msg).join('\n');

    switch (checkErrors.class) {
      case 'ParseCheckErrors': return extract(checkErrors.parseErrors);
      case 'TypeCheckErrors': return extract(checkErrors.typeErrors);
    }
  };
  return errors.map(message).join('\n');
};

const throwIfBadRequest = (r: Response, data: any) => {
  if (r.status === 400) {
    if (isCheckErrors(data)) throw new BadRequestError(errorsMessage(data));
    if (data && data.message) throw new BadRequestError(data.message);
  }
};

const throwUnexpected = (r: Response, data: any): never => {
  throw new ResponseError(
    r.status,
    `Unexpected error. Status: ${r.status} ${r.statusText}. `
      + `Data: ${JSON.stringify(data)}`,
  );
};

const getData = async (r: Response): Promise<any> => {
  if (r.status === 204) return;
  try { return await r.json(); }
  catch (e) { return; }
};

const noKnownExceptions = async (r: Response) => {
  const data = await getData(r);
  if (r.ok) {
    return data;
  }
  throwUnexpected(r, data);
};

const possiblyNotFound = async (r: Response) => {
  const data = await getData(r);
  if (r.ok) {
    return data;
  }
  throwIfNotFound(r, data);
  throwUnexpected(r, data);
};

const possiblyBadRequest = async (r: Response) => {
  const data = await getData(r);
  if (r.ok) {
    return data;
  }
  throwIfBadRequest(r, data);
  throwUnexpected(r, data);
};

const possiblyBadRequestOrNotFound = async (r: Response) => {
  const data = await getData(r);
  if (r.ok) {
    return data;
  }
  throwIfBadRequest(r, data);
  throwIfNotFound(r, data);
  throwUnexpected(r, data);
};

const idString = (id: string | ContractIdValue): string => {
  if (typeof(id) === 'string') {
    return id;
  }
  return id.pseudo.identifier.id;
};

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
    getAll: () => this.http.get('/contracts')
      .then(noKnownExceptions),

    get: (id: string | ContractIdValue) =>
      this.http.get(`/contracts/${idString(id)}`)
        .then(possiblyNotFound),

    tree: (id: string | ContractIdValue) =>
      this.http.get(`/contracts/${idString(id)}/tree`)
        .then(possiblyNotFound),

    src: (id: string | ContractIdValue, simplified: boolean) => {
      const url = simplified ? `/contracts/${idString(id)}/src/?simplified=true`
                             : `/contracts/${idString(id)}/src`;
      return this.http.get(url).then(possiblyNotFound);
    },

    nextEvents: (id: string | ContractIdValue) =>
      this.http.get(`/contracts/${idString(id)}/next-events`)
        .then(possiblyNotFound),

    instantiate: (instantiateInput: InstantiationInput) =>
      this.http.post('/contracts', instantiateInput)
        .then(possiblyBadRequest),

    applyEvent: (id: string | ContractIdValue, event: Event, tag?: Tag) =>
      this.http.post(`/contracts/${idString(id)}/${tag != null ? `${tag}/` : ''}events`, event)
        .then(possiblyBadRequestOrNotFound),

    report: (expressionInput: EvaluateExpressionInput) =>
      this.http.post('/contracts/report', expressionInput)
        .then(possiblyBadRequest),

    reportOnContract: (
      id: string | ContractIdValue,
      expressionInput: EvaluateExpressionInput,
    ) =>
      this.http.post(`/contracts/${idString(id)}/report`, expressionInput)
        .then(possiblyBadRequestOrNotFound),
  };

  declarations: DeclarationsApi = {
    getAll: () => this.http.get('/declarations').then(noKnownExceptions),

    get: (id: string) => this.http.get(`/declarations/${id}`).then(possiblyNotFound),

    add: (i: DeclarationInput) => this.http.post('/declarations', i).then(possiblyBadRequest),

    ontology: (id: string) => this.http.get(`/declarations/${id}/ontology`).then(possiblyNotFound),
  };

  csl: CslApi = {
    check: (i: CheckExpressionInput) => this.http.post('/csl/check', i)
      .then(r => r.ok ? [] : r.json()),

    checkExpression: (i: CheckExpressionInput, id?: string) => {
      return this.http.post(`/csl/check-expression${id != null ? `/${id}` : ''}`, i)
        .then(r => r.ok ? [] : r.json());
    },
  };

  info: InfoApi = {
    get: () => this.http.get('/node-info').then(noKnownExceptions),
    getAgents: () =>
      this.http.get('/agents').then(possiblyBadRequest),
  };
}

export { DeonRestClient };
