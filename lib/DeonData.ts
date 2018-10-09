import { Duration, durationToISOString } from './ISO8601Duration';
import * as Elliptic from 'elliptic';
import { sha3_256 } from 'js-sha3';
import * as lapo_asn1js from '@lapo/asn1js';
import { unarmor } from '@lapo/asn1js/base64';
import base64Js from 'base64-js';

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
  | AgentValue
  | ContractIdValue
  | SignedValue
  | PublicKeyValue;

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

export enum CurveName { secp256k1 = 'secp256k1' }

export interface ECDSAPublicKey {
  tag: 'ECDSAPublicKey';
  pem: string;
  curveName: CurveName;
}

// not used in CSL but for API purposes we create a proper datatype for it.
// This is also why there is no PublicKeyValue
export interface ECDSAPrivateKey {
  tag: 'ECDSAPrivateKey';
  pem: string;
  curveName: CurveName;
}

export const mkECDSAPrivateKey = (pem: string): PrivateKey => ({
  pem,
  tag: 'ECDSAPrivateKey',
  curveName: CurveName.secp256k1,
});

export type PublicKey = ECDSAPublicKey;
export type PrivateKey = ECDSAPrivateKey;

export interface PublicKeyValue {
  class: 'PublicKeyValue';
  publicKey: PublicKey;
  boundName: QualifiedName;
}

export const mkECDSAPublicKeyValue = (pem: string, boundName: QualifiedName): PublicKeyValue => ({
  boundName,
  class: 'PublicKeyValue',
  publicKey: {
    pem,
    tag: 'ECDSAPublicKey',
    curveName: CurveName.secp256k1,
  },
});

export interface ECDSASignature {
  tag: 'ECDSASignature';
  signature: {
    bytes: string,
  };
}

export type Signature = ECDSASignature;

export interface Signed {
  message: string;
  sig: Signature;
}

export interface SignedValue {
  class: 'SignedValue';
  signed: Signed;
  boundName: QualifiedName;
}

const globalEC = new Elliptic.ec(CurveName.secp256k1);

function decodeASN1PublicPem(pem: string) {
  /*
  Informal ASN.1 Schema of openssl elliptic curve private keys (undocumented).
  You can find it (or something like it) by running `openssl asn1parse -in [PUBLIC_KEY] -dump`
  OpenSSLECPublicKey ::= SEQUENCE {
    metadata    SEQUENCE {
      publicKeyType     OBJECT IDENTIFIER 1.2.840.10045.2.1,
      ellipticCurve     OBJECT IDENTIFIER 1.2.840.10045.3.1.7,
    }
    publicKey   BIT STRING
  }
  */
  const decoded = lapo_asn1js.decode(unarmor(pem));
  if (!decoded.sub) {
    throw `Unexpected ASN.1 decode result:\n ${decoded}`;
  }
  const publicKey = decoded.sub[1];

  // hexdump the bitstring of the public key
  const bits =
    publicKey.stream.hexDump(publicKey.posContent(), publicKey.posEnd(), true).substring(2);
  return Buffer.from(bits, 'hex');
}

function decodeASN1PrivatePem(pem: string) {
  /*
  ASN.1 Schema of openssl elliptic curve private keys (https://tools.ietf.org/html/rfc5915):
    ECPrivateKey ::= SEQUENCE {
      version        INTEGER { ecPrivkeyVer1(1) } (ecPrivkeyVer1),
      privateKey     OCTET STRING,
      parameters [0] ECParameters {{ NamedCurve }} OPTIONAL,
      publicKey  [1] BIT STRING OPTIONAL
    }
  */
  const decoded = lapo_asn1js.decode(unarmor(pem));
  if (!decoded.sub) {
    throw `Unexpected ASN.1 decode result:\n ${decoded}`;
  }
  const privateKey = decoded.sub[1];
  const hexstr = privateKey.stream.hexDump(privateKey.posContent(), privateKey.posEnd(), true);
  return Buffer.from(hexstr, 'hex');
}

export function decodePublicKey(pem: string, ec = globalEC) {
  const buffer = decodeASN1PublicPem(pem);
  return ec.keyFromPublic(buffer);
}

export function decodePrivateKey(pem: string, ec = globalEC) {
  const buffer = decodeASN1PrivatePem(pem);
  return ec.keyFromPrivate(buffer);
}

export function checkSignature(pubk: PublicKey, signed: Signed): boolean {
  const pubkdec = decodePublicKey(pubk.pem);
  const hashed = sha3_256(signed.message);
  const der = base64Js.toByteArray(signed.sig.signature.bytes);
  return pubkdec.verify(hashed, der as any);
}

export const mkECDSASignedValue = (
  privk: PrivateKey,
  message: string,
  boundName: QualifiedName,
): SignedValue => {
  const key = decodePrivateKey(privk.pem);
  const hashedMessage = sha3_256(message);
  const signature = key.sign(hashedMessage);
  const pem = base64Js.fromByteArray(signature.toDER());
  return {
    boundName,
    class: 'SignedValue',
    signed: {
      message,
      sig: {
        signature: {
          bytes: pem,
        },
        tag: 'ECDSASignature',
      },
    },
  };
};

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

export interface AgentValue {
  class: 'AgentValue';
  identifier: string;
  boundName: QualifiedName;
}

export interface ContractIdValue {
  class: 'ContractIdValue';
  identifier: ContractIdentifier;
  boundName: QualifiedName;
}

export const mkContractIdValue = (id: string, boundName: QualifiedName): ContractIdValue =>
  ({
    boundName,
    identifier: { id },
    class: 'ContractIdValue',
  });

export interface ContractIdentifier {
  id: string;
}

/* Instantiation arguments */
export type InstantiationArgument
  = Value
  | SelfContractId;

export interface SelfContractId {
  class: 'SelfContractId';
  boundName: QualifiedName;
}

export const selfContractId = (boundName: QualifiedName): SelfContractId => {
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
