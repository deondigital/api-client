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
  get(id: string | D.ContractValue): Promise<D.Contract>;
  tree(id: string | D.ContractValue): Promise<D.ContractTree>;
  src(
    id: string | D.ContractValue,
    simplified: boolean,
  ): Promise<D.ResidualSource>;
  nextEvents(id: string | D.ContractValue): Promise<D.EventPredicate[]>;
  instantiate(i: D.InstantiationInput): Promise<D.InstantiationOutput>;
  applyEvent(
    id: string | D.ContractValue,
    event: D.Event,
    tag?: D.Tag,
  ): Promise<D.Tag | void>;
  getEvents(id: string | D.ContractValue): Promise<D.Value[]>;
}

interface DeclarationsApi {
  getAll(): Promise<D.Declaration[]>;
  get(id: string): Promise<D.Declaration>;
  add(declarationInput: D.DeclarationInput): Promise<D.DeclarationOutput>;
  ontology(id: string): Promise<D.Ontology>;
  report(i: D.EvaluateExpressionInput): Promise<D.Value>;
  reportOnDeclaration(
    id: string,
    i: D.EvaluateExpressionInput,
  ): Promise<D.Value>;
  reportWithName(
    id: string,
    i: D.EvaluateReportInput,
  ): Promise<D.Value>;
}

interface CslApi {
  check(i: D.CheckExpressionInput): Promise<CheckError[]>;
  checkExpression(i: D.CheckExpressionInput, id?: string): Promise<CheckError[]>;
}

interface InfoApi {
  get(): Promise<D.NodeInfoOutput>;
  getAgents(): Promise<D.NamedAgents>;
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
export class ResponseError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export class NotFoundError extends ResponseError {
  constructor(message: string) {
    super(404, message);
  }
}

const errorMessage = (error: CheckError): string => {
  switch (error.tag) {
    case 'GuardError':
      return `Guardedness error on contract ${error.contractName}`;
    default:
      return error.message;
  }
};

export class BadRequestError extends ResponseError {
  constructor(public errors: CheckError[]) {
    super(400, `Bad request: ${errors.map(errorMessage).join('\n')}`);
  }
}

export type CheckError =
  | ParseError
  | TypeError
  | ArgumentTypeError
  | GuardError
  | EventTypeError
  | CallError
  | CSLError
  | SerializationError
;

export interface ParseError {
  tag: 'ParseError';
  message: string;
  position: Position;
  sourceName: string;
}

export interface TypeError {
  tag: 'TypeError';
  message: string;
  location: NodeRange;
}

export interface ArgumentTypeError {
  tag: 'ArgumentTypeError';
  message: string;
  argIdx: number;
}

export interface GuardError {
  tag: 'GuardError';
  location: NodeRange;
  contractName: D.QualifiedName;
  trace: Frame[];
}

export interface EventTypeError {
  tag: 'EventTypeError';
  message: string;
}

export interface CallError {
  tag: 'CallError';
  message: string;
  argumentIndex: number | undefined;
}

export interface CSLError {
  tag: 'CSLError';
  message: string;
}

export interface SerializationError {
  tag: 'SerializationError';
  message: string;
}

const hasTag = (x: unknown): x is { tag: unknown } =>
  typeof x === 'object' && x != null && 'tag' in x;

export const isCheckError = (x: unknown): x is CheckError =>
  hasTag(x)
  && typeof x.tag === 'string'
  && (x.tag ===  'ParseError'
      || x.tag ===  'TypeError'
      || x.tag ===  'ArgumentTypeError'
      || x.tag ===  'GuardError'
      || x.tag ===  'EventTypeError'
      || x.tag ===  'CallError'
      || x.tag ===  'CSLError'
      || x.tag ===  'SerializationError');

export const isCheckErrors = (x: unknown): x is CheckError[] =>
  Array.isArray(x) && x.every(isCheckError);

export const isBadRequest = (x: unknown): x is { errors: any[]} =>
  (x as { errors: any[]}).errors.every(isCheckError);

export type Frame =
  | Call
  | Resolve
;

export interface Call {
  tag: 'Call';
  contractName: D.QualifiedName;
  location: NodeRange;
}

export interface Resolve {
  tag: 'Resolve';
  varName: D.QualifiedName;
  location: NodeRange;
}

export interface Position {
  line: number;
  column: number;
}

export interface NodeRange {
  startPosition: Position;
  endPosition: Position;
}

export {
  DeonApi, ContractsApi, DeclarationsApi, CslApi, InfoApi, ContractUpdate,
};
