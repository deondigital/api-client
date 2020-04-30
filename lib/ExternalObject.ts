/**
 * External objects, descriptions of ledger entities.
 */

import { Value } from './DeonData'; // cyclic deps here
import * as Keys from './Keys';
import * as SignedData from './Signed';

export namespace ExternalObject {

  export class StringAgent {
    tag: 'StringAgent';
    agentIdentifier: string;
    constructor(agentIdentifier: string) {
      this.tag = 'StringAgent';
      this.agentIdentifier = agentIdentifier;
    }
    equals(other: any): boolean {
      if (other === this) return true;
      if (other instanceof StringAgent) {
        return other.agentIdentifier === this.agentIdentifier;
      }
      return false;
    }
    hashCode(): number {
      return genericHashCodeCombined(this.agentIdentifier);
    }
  }
  export const mkStringAgent = (agentIdentifier: string): ExternalObject.StringAgent =>
    new StringAgent(agentIdentifier);

  export class CordaAgent {
    tag: 'CordaAgent';
    publicKeyBase58: string;
    confidential: boolean;
    constructor(publicKeyBase58: string, confidential: boolean) {
      this.tag = 'CordaAgent';
      this.publicKeyBase58 = publicKeyBase58;
      this.confidential = confidential;
    }
    equals(other: any): boolean {
      if (other === this) return true;
      if (other instanceof CordaAgent) {
        return (
            other.publicKeyBase58 === this.publicKeyBase58 &&
            other.confidential === this.confidential
        );
      }
      return false;
    }
    hashCode(): number {
      return genericHashCodeCombined(this.publicKeyBase58, this.confidential);
    }
  }
  export const mkCordaAgent = (
    publicKeyBase58: string,
    confidential: boolean,
  ): ExternalObject.CordaAgent =>
    new CordaAgent(publicKeyBase58, confidential);

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

  export class StringContract {
    tag: 'StringContract';
    contractIdentifier: string;
    constructor(contractIdentifier: string) {
      this.tag = 'StringContract';
      this.contractIdentifier = contractIdentifier;
    }
    equals(other: any): boolean {
      if (other === this) return true;
      if (other instanceof StringContract) {
        return other.contractIdentifier === this.contractIdentifier;
      }
      return false;
    }
    hashCode(): number {
      return genericHashCodeCombined(this.contractIdentifier);
    }
  }
  export const mkContract = (contractIdentifier: string): ExternalObject.StringContract =>
    new StringContract(contractIdentifier);

  const stringHash = (str: string): number => {
    let hash = 0;
    Array.from(str).forEach((_, i) => {
      hash = (((hash << 5) - hash) + str.charCodeAt(i)) | 0;
    });
    return hash;
  };

  const genericHashCode = (o: any): number => {
    switch (typeof (o)) {
      case 'object': {
        if ('hashCode' in o) return o.hashCode();
        throw new Error(`no hashCode() on object: ${JSON.stringify(o)}`);
      }
      case 'number': return o | 0;
      case 'boolean': return o ? 1 : 0;
      case 'undefined': return Number.MAX_SAFE_INTEGER - 1;
      default: return stringHash(o.toString());
    }
  };

  const genericHashCodeCombined = (...objs: any[]): number => {
    let hash = 0;
    objs.forEach((x) => {
      hash = (((hash << 5) - hash) + genericHashCode(x)) | 0;
    });
    return hash;
  };
}

export type ExternalObject
  = ExternalObject.StringAgent
  | ExternalObject.StringContract
  | ExternalObject.CordaAgent
  | ExternalObject.PublicKey
  | ExternalObject.SignedValue;
