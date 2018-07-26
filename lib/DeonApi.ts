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
  getAll(): Promise<D.Contract[]>;
  get(id: string): Promise<D.Contract>;
  tree(id: string): Promise<D.ContractTree>;
  src(id: string, simplified: boolean): Promise<D.ResidualSource>;
  nextEvents(id: string): Promise<D.EventPredicate[]>;
  instantiate(i: D.InstantiationInput): Promise<D.InstantiationOutput>;
  applyEvent(id: string, event: D.Event, tag?: D.Tag): Promise<D.Tag | void>;
  report(i: D.ExpressionInput): Promise<D.Value>;
  reportOnContract(id: string, i: D.ExpressionInput): Promise<D.Value>;
}

interface DeclarationsApi {
  getAll(): Promise<D.Declaration[]>;
  get(id: string): Promise<D.Declaration>;
  add(declarationInput: D.DeclarationInput): Promise<D.DeclarationOutput>;
  ontology(id: string): Promise<D.Ontology>;
}

interface CslApi {
  check(i: D.ExpressionInput): Promise<CheckErrors[]>;
  checkExpression(i: D.ExpressionInput, id?: string): Promise<CheckErrors[]>;
}

interface InfoApi {
  get(): Promise<D.NodeInfoOutput>;
}

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
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class BadRequestError extends Error {
  constructor(message: string) {
    super(message);
  }
}

type CheckErrors
  = { class: 'ParseCheckErrors', parseErrors: ParseError[] }
  | { class: 'TypeCheckErrors', typeErrors: GeneralTypingError[] }
  | { class: 'SanityCheckError', sanityError: string };

interface ParseError {
  msg: string;
  position?: Position;
}

type GeneralTypingError
  = { class: 'TypingError', msg: string, position?: Position }
  | { class: 'ArgumentTypingError', msg: string, argumentIndex: number };

interface Position {
  line: number;
  column: number;
}

export {
  DeonApi, ContractsApi, DeclarationsApi, CslApi, InfoApi,
  ContractUpdate, CheckErrors, ParseError, GeneralTypingError, Position,
};
