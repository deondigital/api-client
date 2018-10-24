import * as Elliptic from 'elliptic';
import * as lapo_asn1js from '@lapo/asn1js';
import { unarmor } from '@lapo/asn1js/base64';

export enum CurveName { SEC_p256k1 = 'SEC_p256k1' }

export function jsCurveName(cn: CurveName): string {
  switch (cn) {
    case CurveName.SEC_p256k1:
      return 'secp256k1';
  }
}

export interface ECDSAPublicKey {
  tag: 'ECDSAPublicKey';
  pem: string;
  curveName: CurveName;
}

// not used in CSL but for API purposes we create a proper datatype for it.
// This is also why there is no PrivateKeyValue
export interface ECDSAPrivateKey {
  tag: 'ECDSAPrivateKey';
  pem: string;
  curveName: CurveName;
}

export const mkECDSAPrivateKey = (pem: string): ECDSAPrivateKey => ({
  pem,
  tag: 'ECDSAPrivateKey',
  curveName: CurveName.SEC_p256k1,
});

export interface ECDSASignature {
  tag: 'ECDSASignature';
  signature: {
    bytes: string,
  };
}

const globalEC = new Elliptic.ec(jsCurveName(CurveName.SEC_p256k1));

/**
 * @returns a binary buffer or a string failure
 */
function decodeASN1PublicPem(pem: string): Buffer | string {
  /*
  Informal ASN.1 Schema of openssl elliptic curve private keys (undocumented).
  You can find it (or something like it) by running `openssl asn1parse -in [PUBLIC_KEY] -dump`
  OpenSSLECPublicKey ::= SEQUENCE {
    metadata    SEQUENCE {
      publicKeyType     OBJECT IDENTIFIER 1.2.840.10045.2.1,
      ellipticCurve     OBJECT IDENTIFIER 1.2.840.10045.3.1.7,
    }
    publicKey   BIT STRING
  }
  */
  try {
    const decoded = lapo_asn1js.decode(unarmor(pem));
    if (!decoded.sub || !decoded.sub[1]) {
      return `Unexpected ASN.1 decode result:\n ${decoded}`;
    }
    const publicKey = decoded.sub[1];

    // hexdump the bitstring of the public key
    const bits =
      publicKey.stream.hexDump(publicKey.posContent(), publicKey.posEnd(), true).substring(2);
    return Buffer.from(bits, 'hex');
  } catch (err) {
    return err.toString();
  }
}

/**
 * @returns a binary buffer or a string failure
 */
function decodeASN1PrivatePem(pem: string): Buffer | string {
  /*
  ASN.1 Schema of openssl elliptic curve private keys (https://tools.ietf.org/html/rfc5915):
    ECPrivateKey ::= SEQUENCE {
      version        INTEGER { ecPrivkeyVer1(1) } (ecPrivkeyVer1),
      privateKey     OCTET STRING,
      parameters [0] ECParameters {{ NamedCurve }} OPTIONAL,
      publicKey  [1] BIT STRING OPTIONAL
    }
  */
  try {
    const decoded = lapo_asn1js.decode(unarmor(pem));
    if (!decoded.sub || !decoded.sub[1]) {
      return `Unexpected ASN.1 decode result:\n ${decoded}`;
    }
    const privateKey = decoded.sub[1];
    const hexstr = privateKey.stream.hexDump(privateKey.posContent(), privateKey.posEnd(), true);
    return Buffer.from(hexstr, 'hex');
  } catch (err) {
    return err.toString();
  }
}

export function decodePublicKey(pem: string): Elliptic.ec.KeyPair | string {
  const buffer = decodeASN1PublicPem(pem);
  if (typeof buffer === 'string') {
    return buffer;
  }
  try {
    return globalEC.keyFromPublic(buffer);
  } catch (err) {
    return err.toString();
  }
}

export function decodePrivateKey(pem: string): Elliptic.ec.KeyPair | string {
  const buffer = decodeASN1PrivatePem(pem);
  if (typeof buffer === 'string') {
    return buffer;
  }
  try {
    return globalEC.keyFromPrivate(buffer);
  } catch (err) {
    return err.toString();
  }
}

export const mkECDSAPublicKey = (pem: string): ECDSAPublicKey => ({
  pem,
  tag: 'ECDSAPublicKey',
  curveName: CurveName.SEC_p256k1,
});
