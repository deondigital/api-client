import { Duration, durationToISOString } from './ISO8601Duration';
import { Signed } from './Signed';
import { PublicKey } from './Keys';
import { Pseudo } from './Pseudo';

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
  declarationExpressionArguments: InstantiationArgument[];
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
  peers: string[];
}

/* Qualified names */
export interface QualifiedName {
  name: string;
  qualifier: string[];
}

export interface ContractIdentifier {
  id: string;
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
}

/* Contracts */
export interface Contract {
  id: string;
  declarationId: string;
  name: string;
  instantiationTimestamp: Date;
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
  | PseudoValue<any>;

export type ContractIdValue = PseudoValue<Pseudo.ContractId>;
export type AgentValue = PseudoValue<Pseudo.Agent>;
export type SignedValue = PseudoValue<Pseudo.Signed>;
export type PublicKeyValue = PseudoValue<Pseudo.PublicKey>;

export interface PseudoValue<P extends Pseudo> {
  class: 'PseudoValue';
  pseudo: P;
  boundName: string;
}

export const mkPseudoValue = <P extends Pseudo>(
  pseudo: P,
  boundName: string,
): PseudoValue<P> => ({
  pseudo, boundName, class: 'PseudoValue',
});

export const mkPublicKeyValue = (
  publicKey: PublicKey,
  boundName: string,
): PseudoValue<Pseudo.PublicKey> => mkPseudoValue(
  { publicKey, tag: 'PseudoPublicKey' },
  boundName,
);

export const mkSignedValue = (
  signed:Signed,
  boundName: string,
): PseudoValue<Pseudo.Signed> =>
  mkPseudoValue(
    { signed, tag: 'PseudoSigned' },
    boundName,
  );

export const mkContractIdValue = (
  id: string,
  boundName: string,
): PseudoValue<Pseudo.ContractId> =>
  mkPseudoValue(
    { identifier: { id }, tag: 'PseudoContractId' },
    boundName,
  );

export interface IntValue {
  class: 'IntValue';
  i: number;
}
export const mkIntValue = (n: number): IntValue =>
  ({ class: 'IntValue', i: n });

export interface FloatValue {
  class: 'FloatValue';
  d: number;
}
export const mkFloatValue = (n: number): FloatValue =>
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

export const mkInstantValue = (instant: Date): InstantValue =>
  ({ class: 'InstantValue', instant: instant.toISOString() });

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

/* Instantiation arguments */
export type InstantiationArgument
  = Value
  | SelfContractId;

export interface SelfContractId {
  class: 'SelfContractId';
  boundName: string;
}

export const selfContractId = (boundName: string): SelfContractId => {
  return { boundName, class: 'SelfContractId' };
};

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
