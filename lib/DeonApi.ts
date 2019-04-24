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
  get(id: string | D.ContractIdValue): Promise<D.Contract>;
  tree(id: string | D.ContractIdValue): Promise<D.ContractTree>;
  src(
    id: string | D.ContractIdValue,
    simplified: boolean,
  ): Promise<D.ResidualSource>;
  nextEvents(id: string | D.ContractIdValue): Promise<D.EventPredicate[]>;
  instantiate(i: D.InstantiationInput): Promise<D.InstantiationOutput>;
  applyEvent(
    id: string | D.ContractIdValue,
    event: D.Event,
    tag?: D.Tag,
  ): Promise<D.Tag | void>;
  report(i: D.EvaluateExpressionInput): Promise<D.Value>;
  reportOnContract(
    id: string | D.ContractIdValue,
    i: D.EvaluateExpressionInput,
  ): Promise<D.Value>;
  database(): Promise<D.DatabaseValue>
}

interface DeclarationsApi {
  getAll(): Promise<D.Declaration[]>;
  get(id: string): Promise<D.Declaration>;
  add(declarationInput: D.DeclarationInput): Promise<D.DeclarationOutput>;
  ontology(id: string): Promise<D.Ontology>;
}

interface CslApi {
  check(i: D.CheckExpressionInput): Promise<CheckError[]>;
  checkExpression(i: D.CheckExpressionInput, id?: string): Promise<CheckError[]>;
}

interface InfoApi {
  get(): Promise<D.NodeInfoOutput>;
  getAgents(): Promise<D.AgentValue[]>;
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

export class BadRequestError extends ResponseError {
  constructor(message: string) {
    super(400, message);
  }
}

export type CheckError =
  | ParseError
  | TypeError
  | ArgumentTypeError
  | GuardError
  | EventTypeError
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

const hasTag = (x: unknown): x is { tag: unknown } =>
  typeof x === 'object' && x != null && 'tag' in x;

export const isCheckError = (x: unknown): x is CheckError =>
  hasTag(x)
  && typeof x.tag === 'string'
  && (x.tag ===  'ParseError'
      || x.tag ===  'TypeError'
      || x.tag ===  'ArgumentTypeError'
      || x.tag ===  'GuardError'
      || x.tag ===  'EventTypeError');

export const isCheckErrors = (x: unknown): x is CheckError[] =>
  Array.isArray(x) && x.every(isCheckError);

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
