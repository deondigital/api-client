/**
 * External objects, descriptions of ledger entities.
 */

import { Value } from './DeonData'; // cyclic deps here
import * as Keys from './Keys';
import * as SignedData from './Signed';

export namespace ExternalObject {

  export interface Agent {
    tag: 'Agent';
    agentIdentifier: string;
  }
  export const mkAgent = (agentIdentifier: string): ExternalObject.Agent =>
    ({ agentIdentifier, tag: 'Agent' });

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

  export interface Contract {
    tag: 'Contract';
    contractIdentifier: string;
  }
  export const mkContract = (contractIdentifier: string): ExternalObject.Contract =>
    ({ contractIdentifier, tag: 'Contract' });
}

export type ExternalObject
  = ExternalObject.Agent
  | ExternalObject.Contract
  | ExternalObject.PublicKey
  | ExternalObject.SignedValue;
