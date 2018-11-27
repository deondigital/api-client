import { sha3_256 } from 'js-sha3';
import base64Js from 'base64-js';
import { ECDSASignature, decodePrivateKey, ECDSAPrivateKey, decodePublicKey } from './ECDSA';
import { PublicKey } from './Keys';

export type Signature = ECDSASignature;

export interface Signed<T> {
  message: T;
  sig: Signature;
}

export const signWithECDSA = <T>(
  privk: ECDSAPrivateKey,
  message: T,
  serializer: (msg:T) => string,
): Signed<T> | string => {
  const key = decodePrivateKey(privk.pem);
  if (typeof key === 'string') { // error
    return key;
  }
  const hashedMessage = sha3_256(serializer(message));
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

export function checkSignature<T>(
  pubk: PublicKey,
  signed: Signed<T>,
  serializer: ((msg:T) => string),
): boolean | string {
  const pubkdec = decodePublicKey(pubk.pem);
  if (typeof pubkdec === 'string') { // error
    return pubkdec;
  }
  const hashed = sha3_256(serializer(signed.message));
  const der = base64Js.toByteArray(signed.sig.signature.bytes);
  return pubkdec.verify(hashed, der as any);
}
