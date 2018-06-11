import * as D from './DeonData';

/**
 * Interface for Deon REST service.
 */
interface DeonApi {
  contracts: ContractsApi;
  declarations: DeclarationsApi;
  csl: CslApi;
  info: InfoApi;
}

interface ContractsApi {
  getAll(): Promise<RestResponse<D.Contract[], void>>;
  get(id: string): Promise<RestResponse<D.Contract, NotFoundError>>;
  tree(id: string): Promise<RestResponse<D.ContractTree, NotFoundError>>;
  src(id: string, simplified: boolean): Promise<RestResponse<D.ResidualSource, NotFoundError>>;
  nextEvents(id: string): Promise<RestResponse<D.EventPredicate[], NotFoundError>>;
  instantiate(i: D.InstantiationInput):
    Promise<RestResponse<D.InstantiationOutput, BadRequestError>>;
  applyEvent(id: string, event: D.Event, tag?: D.Tag):
    Promise<RestResponse<D.Tag, BadRequestError | NotFoundError>>;
  report(i: D.ExpressionInput): Promise<RestResponse<D.Value, BadRequestError>>;
  reportOnContract(id: string, i: D.ExpressionInput):
    Promise<RestResponse<D.Value, BadRequestError | NotFoundError>>;
}

interface DeclarationsApi {
  getAll(): Promise<RestResponse<D.Declaration[], void>>;
  get(id: string): Promise<RestResponse<D.Declaration, NotFoundError>>;
  add(declarationInput: D.DeclarationInput):
    Promise<RestResponse<D.DeclarationOutput, BadRequestError>>;
  ontology(id: string): Promise<RestResponse<D.Ontology, NotFoundError>>;
}

interface CslApi {
  check(i: D.ExpressionInput): Promise<RestResponse<void, CheckErrors[]>>;
  checkExpression(i: D.ExpressionInput, id?: string): Promise<RestResponse<void, CheckErrors[]>>;
}

interface InfoApi {
  get(): Promise<RestResponse<D.NodeInfoOutput, void>>;
}

/**
 * Represents a response from a webserver.
 * "ok" will be true iff the status code is in the range 200-299.
 */
type RestResponse<TOk, TFail>
  = { ok: true, statusCode: number, data?: TOk }
  | { ok: false, statusCode: number, data?: TFail };

/**
 * WebSocket message format
 */
type ContractUpdate
  = { type: 'add', contract: D.Contract }
  | { type: 'update', contract: D.Contract }
  | { type: 'batch', itemUpdates: BatchItemUpdate[] };

export type BatchItemUpdate
  = { type: 'AddContractSuccess', ref: string }
  | { type: 'AddContractFail', ref: string, error: string }
  | { type: 'AddEventSuccess', ref: string }
  | { type: 'AddEventFail', ref: string, error: string };

/* Error types */
export interface NotFoundError { message: string; }
export interface BadRequestError { message: string; }

type CheckErrors
  = { class: 'ParseCheckErrors', parseErrors: ParseError[] }
  | { class: 'TypeCheckErrors', typeErrors: TypingError[] }
  | { class: 'SanityCheckError', sanityError: string };

interface ParseError {
  msg: string;
  position?: Position;
}

interface TypingError {
  msg: string;
  position?: Position;
}

interface Position {
  line: number;
  column: number;
}

export {
  DeonApi, ContractsApi, DeclarationsApi, CslApi, InfoApi,
  ContractUpdate, RestResponse, CheckErrors, ParseError, TypingError, Position,
};
