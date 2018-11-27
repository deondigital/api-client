import { expect } from 'chai';
import 'mocha';

import { stringifyCanonically, noExponents } from '../lib/CanonicalJSON';

describe('noExponents', () => {
  it('works with a very small number', () => {
    expect(noExponents(0.000000123456789)).equals('0.000000123456789');
  });
  it('works with a very small negative number', () => {
    expect(noExponents(-0.000000123456789)).equals('-0.000000123456789');
  });
  it('works with a very large number', () => {
    expect(noExponents(900000123456789)).equals('900000123456789');
  });
  it('works with Number.MAX_VALUE', () => {
    // tslint:disable-next-line:max-line-length
    expect(noExponents(Number.MAX_VALUE)).equals('179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000');
  });
  it('works with Number.MIN_VALUE', () => {
    // tslint:disable-next-line:max-line-length
    expect(noExponents(Number.MIN_VALUE)).equals('0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005');
  });
  it('works with Number.MAX_SAFE_INTEGER', () => {
    expect(noExponents(9007199254740991)).equals('9007199254740991');
  });
});
describe('stringifyCanonically', () => {
  it('works for a simple string', () => {
    expect(stringifyCanonically('foo')).equals('"foo"');
  });
  it('works for a simple object', () => {
    expect(stringifyCanonically({
      fortytwo: 42,
      bar: 'baz',
    })).equals('{"bar":"baz","fortytwo":42}');
  });
  it('works for nested object', () => {
    expect(stringifyCanonically({
      zoo: {
        moo: true,
        123: 'false',
      },
      bar: 'baz',
    })).equals('{"bar":"baz","zoo":{"123":"false","moo":true}}');
  });
  it('works with very small numbers', () => {
    expect(stringifyCanonically({
      small: 0.000000123456789,
    })).equals('{"small":0.000000123456789}');
  });
});
