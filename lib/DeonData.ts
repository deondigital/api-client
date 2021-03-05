import { Duration, durationToISOString } from './ISO8601Duration';
import { Signed, signWithECDSA, checkSignature } from './Signed';
import { PublicKey, PrivateKey } from './Keys';
import { ExternalObject } from './ExternalObject';
import { stringifyCanonically } from './CanonicalJSON';

/* API Input and output wrappers */

export interface OntologyAndEntrypointSignatures {
  ontology: OntologyElement[];
  entrypointSignatures: EntrypointSignature[];
}

export interface EntrypointSignatureRequest {
  csl: string;
}

export type EntrypointSignature
  = TemplateEntrypoint
  | ContractEntrypoint;

export interface TemplateEntrypoint {
  tag: 'TemplateEntrypoint';
  name: QualifiedName;
  type: OntologyTypeIdentifier;
}

export interface ContractEntrypoint {
  tag: 'ContractEntrypoint';
  name: QualifiedName;
  type: OntologyTypeIdentifier;
}

export interface OntologyRequest {
  csl: string;
}

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
  declarationExpressionArgument: Value;
  entryPoint: QualifiedName;
  peers: ExternalObject[];
}

export interface InstantiationOutput {
  contractId: string;
  tag: string;
}

export interface TerminationInput {
  terminatedAtTime: Date;
  description: string;
}

export interface NovationInput {
  replacementContract: InstantiationInput;
  description: string;
  time: Date;
}

export interface CheckExpressionInput {
  csl: string;
}

export interface EvaluateExpressionInput {
  csl: string;
  values?: Value[];
}

export interface EvaluateReportInput {
  reportName: QualifiedName;
  arguments: Value[];
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
  type: Type;
  agent: ReifiedAgentMatcher;
  eventName: String | undefined;
  exp: ReifiedExp;
  env: ReifiedHeap;
  entities: ExternalObject[];
  residualContract: ReifiedContract;
}

export interface ReifiedRuntimeContract {
  heap: ReifiedHeap;
  entities: ExternalObject[];
  runtimeContract: ReifiedContract;
}

export interface ReifiedHeap {
  hValue: ReifiedValue[];
  hConstant: ReifiedConstant[];
  hExp: ReifiedExp[];
  hValueEnv: ReifiedValueEnv[];
  hAtomTerm: ReifiedAtomTerm[];
  hContract: ReifiedContract[];
  hCSLEnv: ReifiedCSLEnv[];
  hContractEnv: ReifiedContractEnv[];
  hTemplateEnv: ReifiedTemplateEnv[];
  hSupertypeEnv: ReifiedSupertypeEnv[];
  hRulesEnv: ReifiedRulesEnv[];
  hAtom: ReifiedAtom[];
}

export interface ReifiedCSLEnv {
  contractEnv: number;
  templateEnv: number;
  valueEnv: number;
  supertypeEnv: number;
  rulesEnv: number;
}

export type ReifiedAtom =
  ReifiedAAtom
  | ReifiedAtomRefl
  | ReifiedAtomHasEvent;

export interface ReifiedAAtom {
  tag: 'Atom';
  name: QualifiedName;
  arguments: number[];
}

export interface ReifiedAtomRefl {
  tag: 'Refl';
  left: number;
  right: number;
}

export interface ReifiedAtomHasEvent {
  tag: 'HasEvent';
  cid: number;
  event: number;
}

export type ReifiedConstant
  = ReifiedCInt
  | ReifiedCString
  | ReifiedCFloat
  | ReifiedCInstant
  | ReifiedCDuration
  | ReifiedCTime
  | ReifiedCPeriod
  | ReifiedCYear
  | ReifiedCYearMonth
  | ReifiedCDate
  | ReifiedCZonedDateTime
  | ReifiedCZoneOffset
  | ReifiedCQuote;

export interface ReifiedCInt {
  tag: 'Int';
  value: number;
}

export interface ReifiedCString {
  tag: 'String';
  value: string;
}

export interface ReifiedCFloat {
  tag: 'Float';
  value: string;
}

export interface ReifiedCInstant {
  tag: 'Instant';
  instant: string;
}

export interface ReifiedCDuration {
  tag: 'Duration';
  duration: string;
}

export interface ReifiedCTime {
  tag: 'Time';
  value: number;
}

export interface ReifiedCPeriod {
  tag: 'Period';
  value: string;
}

export interface ReifiedCYear {
  tag: 'Year';
  value: number;
}

export interface ReifiedCYearMonth {
  tag: 'YearMonth';
  value: string;
}

export interface ReifiedCDate {
  tag: 'Date';
  value: string;
}

export interface ReifiedCZonedDateTime {
  tag: 'ZonedDateTime';
  value: string;
}

export interface ReifiedCZoneOffset {
  tag: 'ZoneOffset';
  value: number;
}

export interface ReifiedCQuote {
  tag: 'Quote';
  symbol: number;
}

export type ReifiedValue =
  ReifiedConstructor
  | ReifiedConstantValue
  | ReifiedRecord
  | ReifiedFunction
  | ReifiedList
  | ReifiedTuple
  | ReifiedMap
  | ReifiedSet;

export interface ReifiedConstructor {
  tag: 'Constructor';
  constructorName: QualifiedName;
  args: number[];
}

export interface ReifiedConstantValue {
  tag: 'Constant';
  const: number;
}

export interface ReifiedRecord {
  tag: 'Record';
  name: QualifiedName;
  fields: { [key: string]: number };
}

export interface ReifiedFunction {
  tag: 'Function';
  env: number;
  exp: number;
}

export interface ReifiedList {
  tag: 'List';
  elements: number[];
}

export interface ReifiedTuple {
  tag: 'Tuple';
  values: number[];
}

export interface ReifiedMap {
  tag: 'Map';
  sortedEntries: [number, number][];
}

export interface ReifiedSet {
  tag: 'Set';
  sortedElements: [number];
}

export type ReifiedValueEnv = [QualifiedName, number][];

export type ReifiedRulesEnv = [RuleName, ReifiedRule[]][];

export type ReifiedContractEnv = [QualifiedName, ReifiedContractClosure<number>][];

export type ReifiedTemplateEnv = [QualifiedName, ReifiedContractClosure<ReifiedContractTemplate>][];

export type ReifiedSupertypeEnv = [QualifiedName, QualifiedName][];

export interface ReifiedContractClosure<A> {
  closureEnv: number;
  closureBody: A;
}

export interface ReifiedContractTemplate {
  contractParameters: string[];
  expressionParameters: string[];
  contractBody: number;
}

export type RuleName =
  AtomName
  | ReflName
  | HasEventName;

export interface AtomName {
  tag: 'AtomName';
  name: QualifiedName;
}

export interface ReflName {
  tag: 'ReflName';
}

export interface HasEventName {
  tag: 'HasEventName';
}

export interface ReifiedRule {
  tag: 'ReifiedRule';
  head: number;
  body: number[];
}

export type ReifiedExp =
  ReifiedEConstant
  | ReifiedEVar
  | ReifiedEConstructor
  | ReifiedETuple
  | ReifiedELambda
  | ReifiedEApp
  | ReifiedEBuiltInApp
  | RefifiedERecord
  | ReifiedEProject
  | ReifiedEQuery;

export interface ReifiedEConstant {
  tag: 'Constant';
  constant: number;
}

export interface ReifiedEVar {
  tag: 'Var';
  qualifiedName: QualifiedName;
}

export interface ReifiedEConstructor {
  tag: 'Constructor';
  constructorName: QualifiedName;
}

export interface ReifiedETuple {
  tag: 'Tuple';
  values: number[];
}

export interface ReifiedELambda {
  tag: 'Lambda';
  cases: ReifiedCase[];
}

export interface ReifiedEApp {
  tag: 'App';
  expression: number;
  arg: number;
}

export interface ReifiedEBuiltInApp {
  tag: 'BuiltInApp';
  builtInName: string;
  args: number[];
}

export interface RefifiedERecord {
  tag: 'Record';
  type: Type;
  fields: ReifiedField[];
}

export interface ReifiedEProject {
  tag: 'Project';
  expression: number;
  field: string;
}

export interface ReifiedEQuery {
  tag: 'Query';
  ruleTerm: number;
  ruleName: QualifiedName;
  bodyExp: number;
}

export type ReifiedCase = Case<number>;

export interface ReifiedField {
  name: string;
  expression: number;
}

export type ReifiedAtomTerm =
  ReifiedAWildcard
  | ReifiedAVar
  | ReifiedARecord
  | ReifiedAConstant
  | ReifiedAApp
  | ReifiedATuple
  | ReifiedAMap
  | ReifiedASet;

export interface ReifiedAWildcard {
  tag: 'Wildcard';
  vildcardId: string;
}
export interface ReifiedAVar {
  tag: 'Var';
  variableId: string;
}
export interface ReifiedARecord {
  tag: 'Record';
  name: QualifiedName;
  fields:  { [id: string] : number };
}
export interface ReifiedAConstant {
  tag: 'Constant';
  constant: number;
}
export interface ReifiedAApp {
  tag: 'App';
  name: QualifiedName;
  arguments: number[];
}
export interface ReifiedATuple {
  tag: 'Tuple';
  elements: number[];
}
export interface ReifiedAMap{
  tag: 'Map';
  entries: [number, number][];
}
export interface ReifiedASet{
  tag: 'Set';
  entries: [number];
}

export type ReifiedContract =
  | ReifiedSuccess
  | ReifiedFailure
  | ReifiedCVar
  | ReifiedCMetaApp
  | ReifiedPrefix
  | ReifiedBin
  | ReifiedLet
  | ReifiedCApp
  | ReifiedCLambda;

export interface ReifiedSuccess {
  tag: 'Success';
}

export interface ReifiedFailure {
  tag: 'Failure';
}

export interface ReifiedCVar {
  tag: 'Var';
  name: QualifiedName;
}

export interface ReifiedCMetaApp {
  tag: 'MetaApp';
  name: QualifiedName;
  contractArgs: number[];
}

export interface ReifiedCApp {
  tag: 'App';
  lhs: number;
  rhs: number;
}

export interface ReifiedCLambda {
  tag: 'Lambda';
  cases: ReifiedCase[];
}

export interface ReifiedPrefix {
  tag: 'Prefix';
  agent: ReifiedAgentMatcher;
  eventName: string | undefined;
  eventType: Type;
  whereExpression: number | undefined;
  thenContract: number;
}

export interface ReifiedBin {
  tag: 'Bin';
  operator: ContractBinOp;
  lhs: number;
  rhs: number;
}

export interface ReifiedLet {
  tag: 'Let';
  definitions: ReifiedDef[];
  bodyContract: number;
}

export type ReifiedAgentMatcher =
  ReifiedAnyAgent
  | ReifiedMatchAgent;

export interface ReifiedAnyAgent {
  tag: 'AnyAgent';
}

export interface ReifiedMatchAgent {
  tag: 'MatchAgent';
  expression: number;
}

export type ContractBinOp =
  And
  | Or
  | Then;

export interface And {
  tag: 'And';
}

export interface Or {
  tag: 'Or';
}

export interface Then {
  tag: 'Then';
}

export type ReifiedDef =
  ReifiedContractDef
  | ReifiedTemplateDef
  | ReifiedValDef;

export interface ReifiedContractDef {
  tag: 'ReifiedContractDef';
  defRec: boolean;
  defContractBindings: ReifiedContractBinding[];
}

export interface ReifiedTemplateDef {
  tag: 'ReifiedTemplateDef';
  defRec: boolean;
  defTemplateBindings: ReifiedTemplateBinding[];
}

export interface ReifiedValDef {
  tag: 'ReifiedValDef';
  defRec: boolean;
  defValBindings: ReifiedValBinding[];
}

export interface ReifiedContractBinding {
  name: string;
  body: number;
}

export interface ReifiedTemplateBinding {
  name: string;
  isEntrypoint: boolean;
  templateParams: string[];
  expressionParams: string[];
  body: number;
}

export interface ReifiedValBinding {
  name: string;
  isReport: boolean;
  expression: number;
}

/* Contracts */
export interface InstantiationDetails {
  time: Date;
  novates?: String;
}

export interface TerminationDetails {
  terminatedAtTime: Date;
  description: String;
  requestingPeer: ExternalObject;
  novatedBy?: String;
}

export interface Contract {
  id: string;
  declarationId: string;
  name: string;
  instantiationDetails: InstantiationDetails;
  participants: ExternalObject[];
  terminationDetails?: TerminationDetails;
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
  | TimeValue
  | PeriodValue
  | YearValue
  | YearMonthValue
  | DateValue
  | ZonedDateTimeValue
  | ZoneOffsetValue
  | DurationValue
  | ConstructorValue
  | RecordValue
  | ListValue
  | MapValue
  | SetValue
  | TupleValue
  | ExternalObjectValue<any>;

export type ContractValue = StringContractValue | CordaContractValue;
export type StringContractValue = ExternalObjectValue<ExternalObject.StringContract>;
export type CordaContractValue = ExternalObjectValue<ExternalObject.CordaContract>;
export type AgentValue = StringAgentValue | CordaAgentValue;
export type StringAgentValue = ExternalObjectValue<ExternalObject.StringAgent>;
export type CordaAgentValue = ExternalObjectValue<ExternalObject.CordaAgent>;
export type PublicKeyValue = ExternalObjectValue<ExternalObject.PublicKey>;
export type SignedValue = ExternalObjectValue<ExternalObject.SignedValue>;

export const mkStringContractValue = (
  id: string,
): StringContractValue =>
  mkExternalObjectValue(ExternalObject.mkStringContract(id));

export const mkCordaContractValue = (
  txnHash: string,
  txnIndex: string,
): CordaContractValue =>
  mkExternalObjectValue(ExternalObject.mkCordaContract(txnHash, txnIndex));

export const mkStringAgentValue = (
  id: string,
): StringAgentValue =>
  mkExternalObjectValue(ExternalObject.mkStringAgent(id));

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

export interface TimeValue {
  class: 'TimeValue';
  time: number;
}

export const mkTimeValue = (time: number): TimeValue =>
  ({ time, class: 'TimeValue' });

export interface PeriodValue {
  class: 'PeriodValue';
  period: string;
}

export const mkPeriodValue = (period: string): PeriodValue =>
  ({ period, class: 'PeriodValue' });

export interface YearValue {
  class: 'YearValue';
  year: number;
}

export const mkYearValue = (year: number): YearValue =>
  ({ year, class: 'YearValue' });

export interface YearMonthValue {
  class: 'YearMonthValue';
  yearMonth: string;
}

export const mkYearMonthValue = (yearMonth: string): YearMonthValue =>
  ({ yearMonth, class: 'YearMonthValue' });

export interface DateValue {
  class: 'DateValue';
  date: string;
}

export const mkDateValue = (date: string): DateValue =>
  ({ date, class: 'DateValue' });

export interface ZonedDateTimeValue {
  class: 'ZonedDateTimeValue';
  zonedDateTime: string;
}

export const mkZonedDateTimeValue = (zonedDateTime: string): ZonedDateTimeValue =>
  ({ zonedDateTime, class: 'ZonedDateTimeValue' });

export interface ZoneOffsetValue {
  class: 'ZoneOffsetValue';
  zoneOffset: number;
}

export const mkZoneOffsetValue = (zoneOffset: number): ZoneOffsetValue =>
  ({ zoneOffset, class: 'ZoneOffsetValue' });

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

export interface MapValue {
  class: 'MapValue';
  elements: [Value, Value][];
}
export const mkMapValue = (elements: [Value, Value][]): MapValue =>
  ({ elements, class: 'MapValue' });

export interface SetValue {
  class: 'SetValue';
  elements: Value[];
}
export const mkSetValue = (elements: Value[]): SetValue =>
  ({ elements, class: 'SetValue' });

export interface TupleValue {
  class: 'TupleValue';
  values: Value[];
}
export const mkTupleValue = (values: ({ 0: Value, 1: Value} & Value[]) | []): TupleValue => {
  if (values.length === 1) {
    throw new Error('Cannot make a tuple with 1 value');
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

export type AgentMatcher
  = AnyAgent
  | MatchAgent;

export interface AnyAgent {
  tag: 'AnyAgent';
}

export interface MatchAgent {
  tag: 'MatchAgent';
  expression: Exp;
}

export interface Case<E> {
  pattern: Pattern;
  body: E;
}

export type Constant
  = CInt
  | CString
  | CFloat
  | CInstant
  | CTime
  | CPeriod
  | CYear
  | CYearMonth
  | CDate
  | CZonedDateTime
  | CZoneOffset
  | CDuration
  | CQuote;

export interface CInt {
  tag: 'CInt';
  value: number;
}

export interface CString {
  tag: 'CString';
  value: string;
}

export interface CFloat {
  tag: 'CFloat';
  value: string;
}

export interface CInstant {
  tag: 'CInstant';
  value: string;
}

export interface CTime {
  tag: 'CTime';
  value: number;
}

export interface CPeriod {
  tag: 'CPeriod';
  value: string;
}

export interface CYear {
  tag: 'CYear';
  value: number;
}

export interface CYearMonth {
  tag: 'CYearMonth';
  value: string;
}

export interface CDate {
  tag: 'CDate';
  value: string;
}

export interface CZonedDateTime {
  tag: 'CZonedDateTime';
  value: string;
}

export interface CZoneOffset {
  tag: 'CZoneOffset';
  value: number;
}

export interface CDuration {
  tag: 'CDuration';
  value: string;
}

export interface CQuote {
  tag: 'CQuote';
  value: string;
}

export interface PField {
  name: string;
  pattern: Pattern;
}

export interface Field {
  name: string;
  expression: Exp;
}

export type Pattern
  = PWildcard
  | PConstant
  | PRecord
  | PAlias
  | PApp
  | PTuple;

export interface PWildcard {
  tag: 'PWildcard';
}

export interface PConstant {
  tag: 'PConstant';
  constant: Constant;
}

export interface PRecord {
  tag: 'PRecord';
  type: Type;
  fields: PField[];
}

export interface PAlias {
  tag: 'PAlias';
  aliased: Pattern;
  alias: string;
}

export interface PApp {
  tag: 'PApp';
  constructor: QualifiedName;
  args: Pattern[];
}

export interface PTuple {
  tag: 'PTuple';
  args: Pattern[];
}

export type Exp
  = EConstant
  | EVar
  | EConstructor
  | ETuple
  | ELambda
  | EApp
  | EBuiltInApp
  | ERecord
  | EProject
  | EQuery;

export interface EConstant {
  tag: 'EConstant';
  constant: Constant;
}

export interface EVar {
  tag: 'EVar';
  qualifiedName: QualifiedName;
}

export interface EConstructor {
  tag: 'EConstructor';
  constructorName: QualifiedName;
}

export interface ETuple {
  tag: 'ETuple';
  values: Exp[];
}

export interface ELambda {
  tag: 'ELambda';
  cases: Case<Exp>[];
}

export interface EApp {
  tag: 'EApp';
  expression: Exp;
  arg: Exp;
}

export interface EBuiltInApp {
  tag: 'EBuiltInApp';
  builtInName: string;
  args: Exp[];
}

export interface ERecord {
  tag: 'ERecord';
  type: Type;
  fields: Field[];
}

export interface EProject {
  tag: 'EProject';
  expression: Exp;
  field: string;
}

export interface EQuery {
  tag: 'EQuery';
  ruleTerm: AtomTerm;
  ruleName: QualifiedName;
  bodyExp: Exp;
}

export type Type
 = TVar
 | TApply;

export interface TVar {
  tag: 'TVar';
  name: string;
}

export interface TApply {
  tag: 'TApply';
  typeName: QualifiedName;
  args: Type[];
}

export type AtomTerm
  = ATWildcard
  | ATVar
  | ATRecord
  | ATConstant
  | ATApp
  | ATTuple
  | ATMap
  | ATSet;

export interface ATWildcard {
  tag: 'Wildcard';
  wildcardId: string;
}

export interface ATVar {
  tag: 'Var';
  variableId: string;
}

export interface ATRecord {
  tag: 'Record';
  name: QualifiedName;
  fields: { [id: string] : AtomTerm };
}

export interface ATConstant {
  tag: 'Constant';
  constant: Constant;
}

export interface ATApp {
  tag: 'App';
  name: QualifiedName;
  arguments: AtomTerm[];
}

export interface ATTuple {
  tag: 'Tuple';
  elements: AtomTerm[];
}

export interface ATMap {
  tag: 'Map';
  entries: [AtomTerm, AtomTerm][];
}

export interface ATSet {
  tag: 'Set';
  entries: AtomTerm[];
}
