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

  export type Agent = StringAgent;

  export const mkStringAgent = (agentIdentifier: string): ExternalObject.StringAgent =>
    ({ agentIdentifier, tag: 'StringAgent' });

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

  export type Contract = StringContract;

  export const mkStringContract = (
    contractIdentifier: string,
  ): ExternalObject.StringContract =>
    ({ contractIdentifier, tag: 'StringContract' });
}

export type ExternalObject
  = ExternalObject.StringAgent
  | ExternalObject.StringContract
  | ExternalObject.PublicKey
  | ExternalObject.SignedValue;
