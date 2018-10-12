import { sha3_256 } from 'js-sha3';
import base64Js from 'base64-js';
import { ECDSASignature, decodePrivateKey, ECDSAPrivateKey, decodePublicKey } from './ECDSA';
import { PublicKey } from './Keys';

export type Signature = ECDSASignature;

export interface Signed {
  message: string;
  sig: Signature;
}

export const signWithECDSA = (
  privk: ECDSAPrivateKey,
  message: string,
): Signed | string => {
  const key = decodePrivateKey(privk.pem);
  if (typeof key === 'string') {
    return key;
  }
  const hashedMessage = sha3_256(message);
  const signature = key.sign(hashedMessage);
  const pem = base64Js.fromByteArray(signature.toDER());
  return {
    message,
    sig: {
      signature: {
        bytes: pem,
      },
      tag: 'ECDSASignature',
    },
  };
};

export function checkSignature(pubk: PublicKey, signed: Signed): boolean | string {
  const pubkdec = decodePublicKey(pubk.pem);
  if (typeof pubkdec === 'string') {
    return pubkdec;
  }
  const hashed = sha3_256(signed.message);
  const der = base64Js.toByteArray(signed.sig.signature.bytes);
  return pubkdec.verify(hashed, der as any);
}
