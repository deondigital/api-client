import * as D from './DeonData';
import { ExternalObject } from './ExternalObject';

export interface AnonymousDeonApi {
  addDeclaration(declarationInput: D.DeclarationInput): Promise<D.DeclarationOutput>;
  getDeclarations(): Promise<D.Declaration[]>;
  getDeclaration(id: string): Promise<D.Declaration>;

  getOntology(id: string): Promise<D.Ontology>;

  checkContract(i: D.CheckExpressionInput): Promise<CheckResponse>;
  checkExpression(i: D.CheckExpressionInput, id?: string): Promise<CheckResponse>;

  prettyPrintExp(i: D.Exp): Promise<string>;

  getNodeInfo(): Promise<D.NodeInfoOutput>;
  getAgents(): Promise<D.NamedAgents>;
}

export interface IdentifiedDeonApi {
  identity(): ExternalObject;

  getContracts(): Promise<D.Contract[]>;
  getContract(id: string | D.ContractValue): Promise<D.Contract>;
  addContract(i: D.InstantiationInput): Promise<D.InstantiationOutput>;

  src(
    id: string | D.ContractValue,
    simplified: boolean,
  ): Promise<D.ResidualSource>;

  nextEvents(id: string | D.ContractValue): Promise<D.EventPredicate[]>;
  getEvents(id: string | D.ContractValue): Promise<D.Value[]>;
  applyEvent(
    id: string | D.ContractValue,
    event: D.Event,
    tag?: D.Tag,
  ): Promise<D.Tag>;

  postReport(
    i: D.EvaluateExpressionInput,
    id?: string,
  ): Promise<D.Value>;
  postReportWithName(
    i: D.EvaluateReportInput,
    id: string,
  ): Promise<D.Value>;
}

/**
 * Interface for Deon REST service.
 */
export interface DeonApi {
  anonymous: AnonymousDeonApi;
  identified: IdentifiedDeonApi;
}

/**
 * WebSocket message format
 */
export type ContractUpdate
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

export interface CheckResponse {
  errors: CheckError[];
  warnings: Warning[];
}

export type CheckError =
  | ParseError
  | TypeError
  | ArgumentTypeError
  | GuardError
  | ValueTypeError
  | InstantiationError
  | ApplyError
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

export interface ValueTypeError {
  tag: 'ValueTypeError';
  message: string;
}

export interface InstantiationError {
  tag: 'InstantiationError';
  message: string;
}

export interface ApplyError {
  tag: 'ApplyError';
  message: string;
}

export interface CallError {
  tag: 'CallError';
  message: string;
}

export interface CSLError {
  tag: 'CSLError';
  message: string;
}

export interface SerializationError {
  tag: 'SerializationError';
  message: string;
}

export type Warning =
  | LocatedWarning
  | IndexWarning
  ;

export interface LocatedWarning {
  tag: 'LocatedWarning';
  location: NodeRange;
  message: string;
}

export interface IndexWarning {
  tag: 'IndexWarning';
  location: number;
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
      || x.tag ===  'ValueTypeError'
      || x.tag ===  'ApplyError'
      || x.tag ===  'InstantiationError'
      || x.tag ===  'CallError'
      || x.tag ===  'CSLError'
      || x.tag ===  'SerializationError');

export const isCheckErrors = (x: unknown): x is CheckError[] =>
  Array.isArray(x) && x.every(isCheckError);

export const isWarning = (x: unknown): x is Warning =>
  hasTag(x)
  && typeof x.tag === 'string'
  && (x.tag === 'LocatedWarning'
    || x.tag === 'IndexWarning');

export const isWarnings = (x: unknown): x is Warning[] =>
  Array.isArray(x) && x.every(isWarning);

export const isBadRequest = (x: unknown): x is { errors: any[] } =>
  (x as { errors: any[] }).errors.every(isCheckError);

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
