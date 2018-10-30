import * as D from './DeonData';
import { Pseudo } from './Pseudo';

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
  get(id: string | D.PseudoValue<Pseudo.ContractId>): Promise<D.Contract>;
  tree(id: string | D.PseudoValue<Pseudo.ContractId>): Promise<D.ContractTree>;
  src(
    id: string | D.PseudoValue<Pseudo.ContractId>,
    simplified: boolean,
  ): Promise<D.ResidualSource>;
  nextEvents(id: string | D.PseudoValue<Pseudo.ContractId>): Promise<D.EventPredicate[]>;
  instantiate(i: D.InstantiationInput): Promise<D.InstantiationOutput>;
  applyEvent(
    id: string | D.PseudoValue<Pseudo.ContractId>,
    event: D.Event,
    tag?: D.Tag,
  ): Promise<D.Tag | void>;
  report(i: D.EvaluateExpressionInput): Promise<D.Value>;
  reportOnContract(
    id: string | D.PseudoValue<Pseudo.ContractId>,
    i: D.EvaluateExpressionInput,
  ): Promise<D.Value>;
}

interface DeclarationsApi {
  getAll(): Promise<D.Declaration[]>;
  get(id: string): Promise<D.Declaration>;
  add(declarationInput: D.DeclarationInput): Promise<D.DeclarationOutput>;
  ontology(id: string): Promise<D.Ontology>;
}

interface CslApi {
  check(i: D.CheckExpressionInput): Promise<CheckErrors[]>;
  checkExpression(i: D.CheckExpressionInput, id?: string): Promise<CheckErrors[]>;
}

interface InfoApi {
  get(): Promise<D.NodeInfoOutput>;
  getAgents(): Promise<D.PseudoValue<Pseudo.Agent>[]>;
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
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
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

type CheckErrors
  = { class: 'ParseCheckErrors', parseErrors: ParseError[] }
  | { class: 'TypeCheckErrors', typeErrors: GeneralTypingError[] }
  | { class: 'SanityCheckError', sanityError: string };

export const isCheckErrors = (x: any): x is CheckErrors[] =>
  Array.isArray(x)
  && x.every(y => typeof y === 'object' &&
             (y.class === 'ParseCheckErrors' ||
              y.class === 'TypeCheckErrors' ||
              y.class === 'SanityCheckError'));

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
