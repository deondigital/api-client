/**
 * Pseudo-syntactical values -- that is, values that have no syntactical representation
 * */

import { ContractIdentifier } from './DeonData'; // cyclic deps here
import * as Keys from './Keys';
import * as SignedData from './Signed';

export namespace Pseudo {

  export interface Agent {
    tag: 'PseudoAgent';
    identifier: string;
  }
  export interface PublicKey {
    tag: 'PseudoPublicKey';
    publicKey: Keys.PublicKey;
  }
  export interface Signed {
    tag: 'PseudoSigned';
    signed: SignedData.Signed;
  }
  export interface ContractId {
    tag: 'PseudoContractId';
    identifier: ContractIdentifier;
  }
}

export type Pseudo
  = Pseudo.Agent
  | Pseudo.ContractId
  | Pseudo.PublicKey
  | Pseudo.Signed;
