import { expect } from 'chai';
import 'mocha';
import {
  qual, mkPublicKeyValue,
} from '../lib/DeonData';
import {
  mkECDSAPrivateKey,
  mkECDSAPublicKey,
} from '../lib/ECDSA';

import {
  signWithECDSA,
  checkSignature,
} from '../lib/Signed';
import { Pseudo } from '../lib/Pseudo';

const id = <T>(x:T) => x;

describe('QualifiedName', () => {
  it('qualified named with no module', () => {
    expect(qual('A')).to.deep.equal({ name: 'A', qualifier: [] });
  });
  it('qualified name with module', () => {
    expect(qual('A::a')).to.deep.equal({ name: 'a', qualifier: ['A'] });
  });
});

describe('Signed data', () => {
  it('correctly verifies data signed with corresponding public and private keys', () => {
    const publicPem = `
-----BEGIN PUBLIC KEY-----
MFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAEFDpOIaItaN2oAaz4bVVMbFSq2jhYbpvS
JyFpzshkKrjg1Up82XtpOibzmfQTPF+h5iOq9dC/P+BqQwKkVUkU+A==
-----END PUBLIC KEY-----`;

    const privatePem = `
-----BEGIN EC PRIVATE KEY-----
MHQCAQEEIBLDGd9V/M3AgxCo+O+A6GDDIaIY1QQyYL9x969eioJToAcGBSuBBAAK
oUQDQgAEFDpOIaItaN2oAaz4bVVMbFSq2jhYbpvSJyFpzshkKrjg1Up82XtpOibz
mfQTPF+h5iOq9dC/P+BqQwKkVUkU+A==
-----END EC PRIVATE KEY-----`;
    const pubkVal = mkPublicKeyValue(mkECDSAPublicKey(publicPem), 'publicKey');
    const privk = mkECDSAPrivateKey(privatePem);
    const signed =
      signWithECDSA(privk, 'Help me Obi-Wan Kenobi, you\'re my only hope!', id);
    if (typeof signed === 'string') {
      throw signed;
    }
    expect(checkSignature((pubkVal.pseudo as Pseudo.PublicKey).publicKey, signed, id)).to.be.true;
  });

  it('correctly rejects data signed with public and private keys that are not paired', () => {
    const publicPem = `
-----BEGIN PUBLIC KEY-----
MFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAEFDpOIaItaN2oAaz4bVVMbFSq2jhYbpvS
JyFpzshkKrjg1Up82XtpOibzmfQTPF+h5iOq9dC/P+BqQwKkVUkU+A==
-----END PUBLIC KEY-----`;

    const privatePem = `
-----BEGIN EC PRIVATE KEY-----
MHQCAQEEIGDnTVzZgLvGiri2wbLpzrAjK+FdE/Q8D9O7UO4DhroRoAcGBSuBBAAK
oUQDQgAEdy9CBHRkqwhP4IfQFmj386JU1bB4R15fKVW8MmIObtREFJ4cYDWHo7Ju
vSQCx5o2XUXD2t82qOY8J3/ByehWSQ==
-----END EC PRIVATE KEY-----`;

    const pubkVal = mkPublicKeyValue(mkECDSAPublicKey(publicPem), 'publicKey');
    const privk = mkECDSAPrivateKey(privatePem);
    const signed =
      signWithECDSA(privk, 'Help me Obi-Wan Kenobi, you\'re my only hope!', id);
    if (typeof signed === 'string') {
      throw signed;
    }
    expect(checkSignature((pubkVal.pseudo as Pseudo.PublicKey).publicKey, signed, id)).to.be.false;
  });

  it('fails when attempting to sign with a malformed private key', () => {

    const privatePem = `
-----BEGIN EC PRIVATE KEY-----
MHQCAQEEIGDnTVzZgLvGiri2wbLpzrAjKæ+FdE/Q8D9O7UO4DhroRoAcGBSuBBAAK
oUQDQgAEdy9CBHRkqwhP4IfQFmj386JU1bB4R15fKVW8MmIObtREFJ4cYDWHo7Ju
vSQCx5o2XUXD2t82qOY8J3/ByehWSQ==
-----END EC PRIVATE KEY-----`;

    const privk = mkECDSAPrivateKey(privatePem);
    const signed =
      signWithECDSA(privk, 'Help me Obi-Wan Kenobi, you\'re my only hope!', id);
    expect(typeof signed).to.equal('string');
  });

  it('fails when attempting to check signature with a malformed public key', () => {
    const publicPem = `
-----BEGIN PUBLIC KEY-----
MFYwEAYHKoZIzj0CAQYFKfoo4EEAAoDQgAEFDpOIaItaN2oAaz4bVVMbFSq2jhYbpvS
JyFpzshkKrjg1Up82XtpOibzmfQTPF+h5iOq9dC/P+BqQwKkVUkU+A==
-----END PUBLIC KEY-----`;

    const privatePem = `
-----BEGIN EC PRIVATE KEY-----
MHQCAQEEIBLDGd9V/M3AgxCo+O+A6GDDIaIY1QQyYL9x969eioJToAcGBSuBBAAK
oUQDQgAEFDpOIaItaN2oAaz4bVVMbFSq2jhYbpvSJyFpzshkKrjg1Up82XtpOibz
mfQTPF+h5iOq9dC/P+BqQwKkVUkU+A==
-----END EC PRIVATE KEY-----`;
    const pubkVal = mkPublicKeyValue(mkECDSAPublicKey(publicPem), 'publicKey');
    const privk = mkECDSAPrivateKey(privatePem);
    const signed =
      signWithECDSA(privk, 'Help me Obi-Wan Kenobi, you\'re my only hope!', id);
    if (typeof signed === 'string') {
      throw signed;
    }
    const check = checkSignature((pubkVal.pseudo as Pseudo.PublicKey).publicKey, signed, id);
    expect(typeof check).to.equal('string');
  });
});
