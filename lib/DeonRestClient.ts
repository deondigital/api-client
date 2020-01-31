import {
  DeonApi,
  ContractsApi,
  DeclarationsApi,
  CslApi,
  InfoApi,
  NotFoundError,
  BadRequestError,
  ResponseError,
  CheckError,
  isCheckErrors,
  isBadRequest,
} from './DeonApi';
import {
  InstantiationInput,
  CheckExpressionInput,
  EvaluateExpressionInput,
  DeclarationInput,
  Event,
  Tag,
  ContractValue,
  EvaluateReportInput,
  Exp,
} from './DeonData';
import { HttpClient, Response } from './HttpClient';

const throwIfNotFound = (r: Response, data: any) => {
  if (r.status === 404 && data && data.message) {
    throw new NotFoundError(data.message);
  }
};

const throwIfBadRequest = (r: Response, data: any) => {
  if (r.status === 400) {
    if (isBadRequest(data)) throw new BadRequestError(data.errors);
    if (isCheckErrors(data)) throw new BadRequestError(data);
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

const checkHandler = async (r: Response): Promise<CheckError[]> => {
  if (r.ok) { return []; }
  if (r.status === 400) {
    return r.json().then((json: {errors: CheckError[]}) => json.errors);
  }
  throw new ResponseError(r.status, JSON.stringify(r));
};

const idString = (id: string | ContractValue): string => {
  if (typeof(id) === 'string') {
    return id;
  }
  return id.externalObject.contractIdentifier;
};

/**
 * Constructs a Deon REST client.
 */
class DeonRestClient implements DeonApi {
  constructor(private http: HttpClient) {}

  static create = (
    fetch: (url: any, init: any) => Promise<Response>,
    serverUrl: string = '',
    hook: (r: Promise<Response>) => Promise<Response> = r => r,
  ) => new DeonRestClient(new HttpClient(fetch, hook, serverUrl))

  contracts: ContractsApi = {
    getAll: () => this.http.get('/contracts')
      .then(noKnownExceptions),

    get: (id: string | ContractValue) =>
      this.http.get(`/contracts/${idString(id)}`)
        .then(possiblyNotFound),

    tree: (id: string | ContractValue) =>
      this.http.get(`/contracts/${idString(id)}/tree`)
        .then(possiblyNotFound),

    src: (id: string | ContractValue, simplified: boolean) => {
      const url = simplified ? `/contracts/${idString(id)}/src/?simplified=true`
                             : `/contracts/${idString(id)}/src`;
      return this.http.get(url).then(possiblyNotFound);
    },

    nextEvents: (id: string | ContractValue) =>
      this.http.get(`/contracts/${idString(id)}/next-events`)
        .then(possiblyNotFound),

    instantiate: (instantiateInput: InstantiationInput) =>
      this.http.post('/contracts', instantiateInput)
        .then(possiblyBadRequest),

    applyEvent: (id: string | ContractValue, event: Event, tag?: Tag) =>
      this.http.post(`/contracts/${idString(id)}/${tag != null ? `${tag}/` : ''}events`, event)
        .then(possiblyBadRequestOrNotFound),

    getEvents: (id: string | ContractValue) =>
        this.http.get(`/contracts/${idString(id)}/events`)
          .then(possiblyNotFound),
  };

  declarations: DeclarationsApi = {
    getAll: () => this.http.get('/declarations').then(noKnownExceptions),

    get: (id: string) => this.http.get(`/declarations/${id}`).then(possiblyNotFound),

    add: (i: DeclarationInput) => this.http.post('/declarations', i).then(possiblyBadRequest),

    ontology: (id: string) => this.http.get(`/declarations/${id}/ontology`).then(possiblyNotFound),

    report: (expressionInput: EvaluateExpressionInput) =>
      this.http.post('/declarations/report', expressionInput)
        .then(possiblyBadRequest),

    reportOnDeclaration: (
      id: string,
      expressionInput: EvaluateExpressionInput,
    ) =>
      this.http.post(`/declarations/${id}/report`, expressionInput)
        .then(possiblyBadRequestOrNotFound),

    reportWithName: (
      id: string,
      reportInput: EvaluateReportInput,
    ) =>
      this.http.post(`/declarations/${id}/namedReport`, reportInput)
        .then(possiblyBadRequestOrNotFound),
  };

  csl: CslApi = {
    check: (i: CheckExpressionInput) => this.http
      .post('/csl/check', i)
      .then(checkHandler),

    checkExpression: (i: CheckExpressionInput, id?: string) => this.http
      .post(`/csl/check-expression${id != null ? `/${id}` : ''}`, i)
      .then(checkHandler),

    prettyPrintExp: (i: Exp) => this.http
      .post('/csl/prettyPrintExp', i)
      .then(noKnownExceptions),
  };

  info: InfoApi = {
    get: () => this.http.get('/node-info').then(noKnownExceptions),
    getAgents: () =>
      this.http.get('/agents').then(possiblyBadRequest),
  };
}

export { DeonRestClient };
