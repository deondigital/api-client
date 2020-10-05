import {
  DeonApi,
  NotFoundError,
  BadRequestError,
  ResponseError,
  isCheckErrors,
  isBadRequest,
  AnonymousDeonApi,
  IdentifiedDeonApi,
  CheckResponse,
  Warning,
} from './DeonApi';
import {
  InstantiationInput,
  CheckExpressionInput,
  EvaluateExpressionInput,
  DeclarationInput,
  Event,
  ContractValue,
  EvaluateReportInput,
  Exp,
  DeclarationOutput,
  NodeInfoOutput,
  NamedAgents,
  Declaration,
  Ontology,
  Contract,
  InstantiationOutput,
  EventPredicate,
  Value,
  ResidualSource,
  OntologyRequest,
} from './DeonData';
import { HttpClient, Response } from './HttpClient';
import { ExternalObject } from './ExternalObject';

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

const checkHandler = async (r: Response): Promise<CheckResponse> => {
  if (r.ok) {
    return r.json().then((warnings: Warning[]) =>
      ({ warnings, errors: [] }));
  }
  if (r.status === 400) {
    return r.json().then((rsp: CheckResponse) => rsp);
  }
  throw new ResponseError(r.status, JSON.stringify(r));
};

const idString = (id: string | ContractValue): string => {
  if (typeof(id) === 'string') {
    return id;
  }
  return id.externalObject.contractIdentifier;
};

export class AnonymousDeonRestClient implements AnonymousDeonApi {
  constructor(private http: HttpClient) {}

  addDeclaration(i: DeclarationInput): Promise<DeclarationOutput> {
    return this.http.post('/declarations', i)
      .then(possiblyBadRequest);
  }
  getDeclarations(): Promise<Declaration[]> {
    return this.http.get('/declarations')
      .then(noKnownExceptions);
  }
  getDeclaration(id: string): Promise<Declaration> {
    return this.http.get(`/declarations/${id}`)
      .then(possiblyNotFound);
  }
  getOntology(id: string): Promise<Ontology> {
    return this.http.get(`/declarations/${id}/ontology`)
      .then(possiblyNotFound);
  }
  getOntologyForCSL(input: OntologyRequest): Promise<Ontology> {
    return this.http.post('/declarations/ontology', input)
      .then(possiblyBadRequest);
  }
  checkContract(i: CheckExpressionInput): Promise<CheckResponse> {
    return this.http.post('/csl/check', i)
      .then(checkHandler);
  }
  checkExpression(i: CheckExpressionInput, id?: string | undefined): Promise<CheckResponse> {
    return this.http.post(`/csl/check-expression${id != null ? `/${id}` : ''}`, i)
      .then(checkHandler);
  }
  prettyPrintExp(i: Exp): Promise<string> {
    return this.http.post('/csl/prettyPrintExp', i)
      .then(noKnownExceptions);
  }
  getNodeInfo(): Promise<NodeInfoOutput> {
    return this.http.get('/node-info')
      .then(noKnownExceptions);
  }
  getAgents(): Promise<NamedAgents> {
    return this.http.get('/agents').then(possiblyBadRequest);
  }
}

export class IdentifiedDeonRestClient implements IdentifiedDeonApi {
  constructor(private http: HttpClient) {
    if (http.identity == null) {
      throw Error('HTTP connection for IdentifiedDeonRestClient cannot be anonymous.');
    }
  }

  identity(): ExternalObject {
    return this.http.identity!; // null check in ctor
  }
  getContracts(): Promise<Contract[]> {
    return this.http.get('/contracts').then(noKnownExceptions);
  }
  getContract(id: string | ContractValue): Promise<Contract> {
    return this.http.get(`/contracts/${idString(id)}`).then(possiblyNotFound);
  }
  addContract(i: InstantiationInput): Promise<InstantiationOutput> {
    return this.http.post('/contracts', i).then(possiblyBadRequest);
  }

  src(id: string | ContractValue, simplified: boolean)
    : Promise<ResidualSource> {
    const url = simplified ? `/contracts/${idString(id)}/src/?simplified=true`
                             : `/contracts/${idString(id)}/src`;
    return this.http.get(url).then(possiblyNotFound);
  }
  nextEvents(id: string | ContractValue)
    : Promise<EventPredicate[]> {
    return this.http.get(`/contracts/${idString(id)}/next-events`)
      .then(possiblyNotFound);
  }
  getEvents(id: string | ContractValue): Promise<Value[]> {
    return this.http.get(`/contracts/${idString(id)}/events`)
          .then(possiblyNotFound);
  }
  applyEvent(id: string | ContractValue, event: Event, tag?: string | undefined): Promise<string> {
    return this.http.post(`/contracts/${idString(id)}/${tag != null ? `${tag}/` : ''}events`, event)
      .then(possiblyBadRequestOrNotFound);
  }
  postReport(i: EvaluateExpressionInput, id?: string): Promise<Value> {
    if (id == null) {
      return this.http.post('/declarations/report', i)
      .then(possiblyBadRequest);
    }
    return this.http.post(`/declarations/${id}/report`, i)
        .then(possiblyBadRequest);
  }

  postReportWithName(i: EvaluateReportInput, id: string): Promise<Value> {
    return this.http.post(`/declarations/${id}/namedReport`, i)
      .then(possiblyBadRequestOrNotFound);
  }
}

function lookupKeyForValue<T>(m: {[id: string]: T}, val: T): string {
  for (const k of Object.keys(m)) {
    if (m[k] === val) {
      return k;
    }
  }
  throw Error(`Value ${JSON.stringify(val)} not found in ${JSON.stringify(m)}`);
}

export function identifiedDeonRestClient(
  fetch: (url: any, init: any) => Promise<Response>,
  identity: ExternalObject,
  serverUrl: string = '',
  hook: (r: Promise<Response>) => Promise<Response> = r => r,
) : IdentifiedDeonApi {
  return new IdentifiedDeonRestClient(new HttpClient(fetch, hook, serverUrl, identity));
}

export function anonymousDeonRestClient(
  fetch: (url: any, init: any) => Promise<Response>,
  serverUrl: string = '',
  hook: (r: Promise<Response>) => Promise<Response> = r => r,
) : AnonymousDeonApi {
  return new AnonymousDeonRestClient(new HttpClient(fetch, hook, serverUrl));
}

export function deonRestClient(
  fetch: (url: any, init: any) => Promise<Response>,
  identity: ExternalObject,
  serverUrl: string = '',
  hook: (r: Promise<Response>) => Promise<Response> = r => r,
) : DeonApi {
  const anonymous = anonymousDeonRestClient(fetch, serverUrl, hook);
  const identified = identifiedDeonRestClient(fetch, identity, serverUrl, hook);
  return { anonymous, identified };
}

export async function deonRestClientLookupAgent(
  fetch: (url: any, init: any) => Promise<Response>,
  identity: string,
  serverUrl: string = '',
  hook: (r: Promise<Response>) => Promise<Response> = r => r,
) : Promise<DeonApi> {
  const anonymous = anonymousDeonRestClient(fetch, serverUrl, hook);
  const agents = await anonymous.getAgents();
  const myId = ExternalObject.mkStringAgent(lookupKeyForValue(agents, identity));
  const identified = identifiedDeonRestClient(fetch, myId, serverUrl, hook);
  return { anonymous, identified };
}
