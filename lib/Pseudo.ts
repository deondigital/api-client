/**
 * Pseudo-syntactical values -- that is, values that have no syntactical representation
 * */

import { ContractIdentifier, AgentIdentifier, Value } from './DeonData'; // cyclic deps here
import * as Keys from './Keys';
import * as SignedData from './Signed';
import { DatabaseCheckpoint } from './DatabaseCheckpoint';

export namespace Pseudo {

  export interface Agent {
    tag: 'PseudoAgent';
    identifier: AgentIdentifier;
  }
  export interface PublicKey {
    tag: 'PseudoPublicKey';
    publicKey: Keys.PublicKey;
  }
  export interface Signed {
    tag: 'PseudoSigned';
    signed: SignedData.Signed<Value>;
  }
  export interface ContractId {
    tag: 'PseudoContractId';
    identifier: ContractIdentifier;
  }
  export interface Database {
    tag: 'PseudoDatabase';
    dbCheckpoint: DatabaseCheckpoint;
  }
}

export type Pseudo
  = Pseudo.Agent
  | Pseudo.ContractId
  | Pseudo.PublicKey
  | Pseudo.Signed
  | Pseudo.Database;
