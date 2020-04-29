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
  export const mkStringAgent = (agentIdentifier: string): ExternalObject.StringAgent =>
    ({ agentIdentifier, tag: 'StringAgent' });

  export interface CordaAgent {
    tag: 'CordaAgent';
    publicKeyBase58: string;
    confidential: boolean;
  }
  export const mkCordaAgent = (
    publicKeyBase58: string,
    confidential: boolean,
  ): ExternalObject.CordaAgent =>
    ({ publicKeyBase58, confidential, tag: 'CordaAgent' });

  export type Agent = StringAgent | CordaAgent;

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
  export const mkContract = (contractIdentifier: string): ExternalObject.StringContract =>
    ({ contractIdentifier, tag: 'StringContract' });
}

export type ExternalObject
  = ExternalObject.StringAgent
  | ExternalObject.StringContract
  | ExternalObject.CordaAgent
  | ExternalObject.PublicKey
  | ExternalObject.SignedValue;
