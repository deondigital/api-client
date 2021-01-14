/**
 * External objects, descriptions of ledger entities.
 */

import { Value } from './DeonData'; // cyclic deps here
import * as Keys from './Keys';
import * as SignedData from './Signed';

export namespace ExternalObject {

  export interface StringAgent {
    tag: 'StringAgent';
    agentIdentifier: string;
  }

  export interface CordaAgent {
    tag: 'CordaAgent';
    publicKeyBase58: string;
    isConfidential: boolean;
  }

  export type Agent = StringAgent | CordaAgent;

  export const mkStringAgent = (agentIdentifier: string): ExternalObject.StringAgent =>
    ({ agentIdentifier, tag: 'StringAgent' });

  export const mkCordaAgent = (
    publicKeyBase58: string,
    isConfidential: boolean,
  ): ExternalObject.CordaAgent =>
    ({ publicKeyBase58, isConfidential, tag: 'CordaAgent' });

  export interface PublicKey {
    tag: 'PublicKey';
    publicKey: Keys.PublicKey;
  }
  export const mkPublicKey = (publicKey: Keys.PublicKey): ExternalObject.PublicKey =>
    ({ publicKey, tag: 'PublicKey' });

  export interface SignedValue {
    tag: 'SignedValue';
    signedValue: SignedData.Signed<Value>;
  }
  export const mkSignedValue =
    (signedValue: SignedData.Signed<Value>): ExternalObject.SignedValue =>
      ({ signedValue, tag: 'SignedValue' });

  export interface StringContract {
    tag: 'StringContract';
    contractIdentifier: string;
  }

  export interface CordaContract {
    tag: 'CordaContract';
    txnHash: string;
    txnIndex: string;
  }

  export type Contract = StringContract | CordaContract;

  export const mkStringContract = (
    contractIdentifier: string,
  ): ExternalObject.StringContract =>
    ({ contractIdentifier, tag: 'StringContract' });

  export const mkCordaContract = (
    txnHash: string,
    txnIndex: string,
  ): ExternalObject.CordaContract =>
    ({ txnHash, txnIndex, tag: 'CordaContract' });
}

export type ExternalObject
  = ExternalObject.StringAgent
  | ExternalObject.StringContract
  | ExternalObject.CordaAgent
  | ExternalObject.CordaContract
  | ExternalObject.PublicKey
  | ExternalObject.SignedValue;
