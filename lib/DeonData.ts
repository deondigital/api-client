import { Duration, durationToISOString } from './ISO8601Duration';
import { Signed, signWithECDSA, checkSignature } from './Signed';
import { PublicKey, PrivateKey } from './Keys';
import { ExternalObject } from './ExternalObject';
import { stringifyCanonically } from './CanonicalJSON';

/* API Input and output wrappers */
export interface DeclarationInput {
  csl: string;
  name: string;
}

export interface DeclarationOutput {
  declarationId: string;
}

export interface InstantiationInput {
  declarationId: string;
  name: string;
  declarationExpressionArguments: Value[];
  entryPoint: QualifiedName;
  peers: string[];
}

export interface InstantiationOutput {
  contractId: string;
  tag: string;
}

export interface CheckExpressionInput {
  csl: string;
}

export interface EvaluateExpressionInput {
  csl: string;
  values?: Value[];
}

export interface NodeInfoOutput {
  ledgerType: string;
  nodeName: string;
  serviceVersion: string;
}

export interface NamedAgents {
  [id: string]: string;
}

/* Qualified names */
export interface QualifiedName {
  name: string;
  qualifier: string[];
}

export class QualifiedName {
  static equals(qn1: QualifiedName, qn2: QualifiedName) {
    return qn1.name === qn2.name
      && qn1.qualifier.length === qn2.qualifier.length
      && qn1.qualifier.every((s, i) => s === qn2.qualifier[i]);
  }
}

export const qual = (names: string): QualifiedName => {
  const s = names.split('::');
  const name: string = s.slice(-1)[0];
  return { name, qualifier: s.slice(0, -1) };
};

/* Events */
export interface Event {
  record: RecordValue;
}

export type Tag = string;

export interface EventPredicate {
  type: QualifiedName;
  agent?: string;
  exp: string;
  symbols: { [id: string] : ExternalObject };
}

/* Contracts */
export interface Contract {
  id: string;
  declarationId: string;
  name: string;
  instantiationTimestamp: Date;
  participants: string[];
}

export interface ResidualSource {
  csl: string;
}

/* Declarations */
export interface Declaration {
  id: string;
  name: string;
  csl: string;
}

/* Values */
export type Value =
  IntValue
  | FloatValue
  | StringValue
  | BooleanValue
  | InstantValue
  | DurationValue
  | ConstructorValue
  | RecordValue
  | ListValue
  | TupleValue
  | ExternalObjectValue<any>;

export type ContractValue = ExternalObjectValue<ExternalObject.StringContract>;
export type AgentValue = ExternalObjectValue<ExternalObject.StringAgent>;
export type PublicKeyValue = ExternalObjectValue<ExternalObject.PublicKey>;
export type SignedValue = ExternalObjectValue<ExternalObject.SignedValue>;

export const mkContractValue = (
  id: string,
): ContractValue =>
  mkExternalObjectValue(ExternalObject.mkContract(id));

export const mkAgentValue = (
  id: string,
): AgentValue =>
  mkExternalObjectValue(ExternalObject.mkAgent(id));

export const mkPublicKeyValue = (
  publicKey: PublicKey,
): PublicKeyValue => mkExternalObjectValue(ExternalObject.mkPublicKey(publicKey));

export const mkSignedValue = (
  signed:Signed<Value>,
): SignedValue =>
  mkExternalObjectValue(ExternalObject.mkSignedValue(signed));

export const signValue = (
  privateKey: PrivateKey,
  value: Value,
): Signed<Value> => {
  const r = signWithECDSA(privateKey, value, stringifyCanonically);
  if (typeof r === 'string') {
    throw r;
  }
  return r;
};

export const checkValueSignature = (
  publicKey: PublicKey,
  signed: Signed<Value>,
): boolean => {
  const r = checkSignature(publicKey, signed, stringifyCanonically);
  if (typeof r === 'string') {
    throw r;
  }
  return r;
};

export interface IntValue {
  class: 'IntValue';
  i: number;
}
export const mkIntValue = (n: number): IntValue =>
  ({ class: 'IntValue', i: n });

export interface FloatValue {
  class: 'FloatValue';
  d: string;
}
export const mkFloatValue = (n: string): FloatValue =>
  ({ class: 'FloatValue', d: n });

export interface StringValue {
  class: 'StringValue';
  s: string;
}
export const mkStringValue = (s: string): StringValue =>
  ({ s, class: 'StringValue' });

export interface BooleanValue {
  class: 'BooleanValue';
  b: boolean;
}
export const mkBooleanValue = (b: boolean): BooleanValue =>
  ({ b, class: 'BooleanValue' });

export interface InstantValue {
  class: 'InstantValue';
  instant: string;
}

export interface DurationValue {
  class: 'DurationValue';
  duration: string;
}

export const mkDurationValue = (duration: Duration): DurationValue =>
  ({ class: 'DurationValue', duration: durationToISOString(duration) });

/**
 * Format a number that is part of a date.
 * The output string has two integral digits and no redundant fractional zeros
 * @param n
 */
export function fmtdatenum(m: number) {
  if (m < 10 && m >= 0) {
    return `0${m}`;
  }
  if (m > -10 && m < 0) {
    return `-0${Math.abs(m)}`;
  }
  return m.toString();
}

export function instantToIsoStringNoTrailingZeros(instant: Date): string {
  const s = instant.toISOString();
  return s.replace(
    /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:)(\d{2}\.\d{3})Z/,
    (_, prefix, seconds) => {
      return `${prefix}${fmtdatenum(Number.parseFloat(seconds))}Z`;
    },
  );
}

export const mkInstantValue = (instant: Date): InstantValue =>
  ({ class: 'InstantValue', instant: instantToIsoStringNoTrailingZeros(instant) });

export interface ConstructorValue {
  class: 'ConstructorValue';
  name: QualifiedName;
  args: Value[];
}
export const mkConstructorValue = (name: QualifiedName, args: Value[]): ConstructorValue =>
  ({ name, args, class: 'ConstructorValue' });

export interface RecordValue {
  class: 'RecordValue';
  recordTag: QualifiedName;
  fields: { [key: string]: Value };
}
export const mkRecordValue =
  (recordTag: QualifiedName, fields: { [key: string]: Value }): RecordValue =>
    ({ recordTag, fields, class: 'RecordValue' });

export interface ListValue {
  class: 'ListValue';
  elements: Value[];
}
export const mkListValue = (elements: Value[]): ListValue =>
  ({ elements, class: 'ListValue' });

export interface TupleValue {
  class: 'TupleValue';
  values: Value[];
}
export const mkTupleValue = (values: { 0: Value, 1: Value} & Value[]): TupleValue => {
  if (values.length < 2) {
    throw new Error('Cannot make tuple with less than 2 values');
  }
  return { values, class: 'TupleValue' };
};

export interface ExternalObjectValue<E extends ExternalObject> {
  class: 'ExternalObjectValue';
  externalObject: E;
}
export const mkExternalObjectValue =
  <E extends ExternalObject> (externalObject: E): ExternalObjectValue<E> =>
    ({ externalObject, class: 'ExternalObjectValue' });

/* Contract AST tree */
export type ContractTree
  = TSuccess
  | TFail
  | TPrefix
  | TOr
  | TAnd
  | TSeq
  | TLet
  | TApp
  | TContractVar;

export interface TSuccess {
  class: 'Success';
}

export interface TFail {
  class: 'Fail';
}

export interface TPrefix {
  class: 'Prefix';
  eventName?: string;
  eventPredicate: EventPredicate;
  residual: ContractTree;
}

export interface TOr {
  class: 'Or';
  left: ContractTree;
  right: ContractTree;
}

export interface TAnd {
  class: 'And';
  left: ContractTree;
  right: ContractTree;
}

export interface TSeq {
  class: 'Seq';
  left: ContractTree;
  right: ContractTree;
}

export type TDef
  = TTemplateDef
  | TContractVarDef
  | TValueDef;

export interface TTemplateDef {
  class: 'TemplateDef';
  name: string;
  contractParameters: string[];
  expressionParameters: string[];
  contract: ContractTree;
}

export interface TContractVarDef {
  class: 'ContractVarDef';
  name: string;
  contract: ContractTree;
}

export interface TValueDef {
  class: 'ValueDef';
  name: string;
  expression: string;
}

export interface TLet {
  class: 'Let';
  defs: TDef[];
  contract: ContractTree;
}

export interface TApp {
  class: 'App';
  name: QualifiedName;
  contractArguments: ContractTree;
  expressionArguments: string[];
}

export interface TContractVar {
  class: 'ContractVar';
  id: string;
}

/* Ontology */
// export type Ontology = OntologyElement[];
export class Ontology extends Array<OntologyElement> {
  static lookup(ontology: Ontology, typeName: QualifiedName): OntologyElement | undefined {
    return ontology.find(oe => QualifiedName.equals(oe.name, typeName));
  }
}

export type OntologyElement
  = OntologyRecord
  | OntologyUnion;

export interface OntologyRecord {
  name: QualifiedName;
  kind: {
    tag: 'OntologyRecord',
    parent: QualifiedName,
    fields: { [fieldName: string]: OntologyTypeIdentifier },
  };
}

export interface OntologyUnion {
  name: QualifiedName;
  kind: {
    tag: 'OntologyUnion',
    parameters: { parameter: string }[];
    constructors: OntologyUnionConstructor[];
  };
}

export interface OntologyUnionConstructor {
  name: string;
  arguments: OntologyTypeIdentifier[];
}

export type OntologyTypeIdentifier
  = { tag: 'Var', identifier: string }
  | { tag: 'Apply', name: QualifiedName, params: OntologyTypeIdentifier[] };
