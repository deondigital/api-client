
import { ECDSAPrivateKey, ECDSAPublicKey } from './ECDSA';

export interface PublicKey extends ECDSAPublicKey {}
export interface PrivateKey extends ECDSAPrivateKey {}
