import { valueToJson } from '../lib/valueToJson';
import { Duration } from '../lib/ISO8601Duration';
import { expect } from 'chai';
import 'mocha';
import * as D from '../lib/DeonData';
import { CurveName } from '../lib/ECDSA';

describe('Fully typed to JSON typed', () => {
  it('works for IntValue', () => { expect(valueToJson(D.mkIntValue(42))).to.equal(42); });
  it('works for FloatValue', () => {
    expect(valueToJson(D.mkFloatValue('42.422'))).to.equal('42.422');
  });
  it('works for StringValue', () => {
    expect(valueToJson(D.mkStringValue('hello there!'))).to.equal('hello there!');
  });
  it('works for BooleanValue', () => {
    expect(valueToJson(D.mkBooleanValue(true))).to.equal(true);
  });
  it('works for InstantValue', () => {
    const then = new Date('December 17, 1995 03:24:21');
    expect(valueToJson(D.mkInstantValue(then))).to.equal(D.instantToIsoStringNoTrailingZeros(then));
  });
  it('works for DurationValue', () => {
    const dur: Duration = {
      days: 1, hours: 20, minutes: 44, seconds: 12.67901,
    } as Duration;
    expect(valueToJson(D.mkDurationValue(dur))).to.equal('P1DT20H44M12.67901S');
  });
  it('works for simple ConstructorValue', () => {
    const c = D.mkConstructorValue(D.qual('C1'), []);
    expect(valueToJson(c)).to.deep.equal(
      {
        name: D.qual('C1'),
        args: [],
      },
    );
  });
  it('works recursively on ConstructorValue args', () => {
    const c = D.mkConstructorValue(D.qual('C2'), [
      D.mkIntValue(42),
      D.mkConstructorValue(
        { name: 'C1', qualifier: ['A', 'B'] },
        [D.mkFloatValue('1.3')])]);
    expect(valueToJson(c)).to.deep.equal(
      {
        name: D.qual('C2'),
        args: [
          42,
          {
            name: { name: 'C1', qualifier: ['A', 'B'] },
            args: ['1.3'],
          },
        ],
      },
    );
  });
  it('works on simple RecordValue', () => {
    const r = D.mkRecordValue(D.qual('R'), {});
    expect(valueToJson(r)).to.deep.equal(
      {
        recordTag: D.qual('R'),
        fields: {},
      },
    );
  });
  it('works recursively on RecordValue fields', () => {
    const r = D.mkRecordValue(
      D.qual('R'),
      {
        a: D.mkRecordValue({ name: 'R2', qualifier: ['ModA', 'Mod2'] }, { a: D.mkIntValue(42) }),
        b: D.mkFloatValue('789.43'),
        c: D.mkBooleanValue(false),
        d: D.mkConstructorValue(D.qual('C'), [D.mkStringValue('d')]),
      },
    );
    expect(valueToJson(r)).to.deep.equal(
      {
        recordTag: D.qual('R'),
        fields: {
          a: {
            recordTag: {
              name: 'R2',
              qualifier: ['ModA', 'Mod2'],
            },
            fields: {
              a: 42,
            },
          },
          b: '789.43',
          c: false,
          d: {
            name: D.qual('C'),
            args: ['d'],
          },
        },
      },
    );
  });
  it('works on empty ListValue', () => {
    const l = D.mkListValue([]);
    expect(valueToJson(l)).to.deep.equal([]);
  });
  it('works on simple ListValue', () => {
    const l = D.mkListValue([D.mkIntValue(1), D.mkIntValue(2), D.mkIntValue(3)]);
    expect(valueToJson(l)).to.deep.equal([1, 2, 3]);
  });
  it('works on nested ListValue', () => {
    const l = D.mkListValue([
      D.mkListValue([D.mkIntValue(1), D.mkIntValue(2)]),
      D.mkListValue([D.mkFloatValue('3.5'), D.mkFloatValue('4.3')]),
    ]);
    expect(valueToJson(l)).to.deep.equal([[1, 2], ['3.5', '4.3']]);
  });
  it('works on empty MapValue', () => {
    const m = D.mkMapValue([]);
    expect(valueToJson(m)).to.deep.equal(new Map());
  });
  it('works on simple MapValue', () => {
    const m = D.mkMapValue([
      [D.mkStringValue('a'), D.mkIntValue(1)],
      [D.mkStringValue('b'), D.mkIntValue(2)]]);
    const expected = new Map();
    expected.set('a', 1).set('b', 2);
    expect(valueToJson(m)).to.deep.equal(expected);
  });
  it('works on nested MapValue', () => {
    const k1 = D.mkMapValue([[D.mkIntValue(1), D.mkFloatValue('1.0')]]);
    const k2 = D.mkMapValue([[D.mkIntValue(2), D.mkFloatValue('2.0')]]);
    const v1 = D.mkMapValue([[D.mkStringValue('a'), D.mkBooleanValue(true)]]);
    const v2 = D.mkMapValue([[D.mkStringValue('b'), D.mkBooleanValue(false)]]);
    const m = D.mkMapValue([[k1, v1], [k2, v2]]);
    const expKey1 = new Map();
    const expKey2 = new Map();
    const expVal1 = new Map();
    const expVal2 = new Map();
    expKey1.set(1, '1.0');
    expKey2.set(2, '2.0');
    expVal1.set('a', true);
    expVal2.set('b', false);
    // We cannot use expect(..) on nested Maps.
    const obj = valueToJson(m) as Map<Map<any, any>, Map<any, any>>;
    const keys = Array.from(obj.keys());
    const values = Array.from(obj.values());
    function mapEq(lhs : Map<any, any>, rhs : Map<any, any>) {
      const leftKeys = Array.from(lhs.keys());
      const rightKeys = Array.from(rhs.keys());
      const leftVals = Array.from(lhs.values());
      const rightVals = Array.from(rhs.values());
      expect(leftKeys).to.deep.equal(rightKeys);
      expect(leftVals).to.deep.equal(rightVals);
    }
    expect(keys.length).to.equal(2);
    expect(values.length).to.equal(2);
    mapEq(keys[0], expKey1);
    mapEq(keys[1], expKey2);
    mapEq(values[0], expVal1);
    mapEq(values[1], expVal2);
  });
  it('works on simple pair', () => {
    const p = D.mkTupleValue([D.mkIntValue(1), D.mkIntValue(2)]);
    expect(valueToJson(p)).to.deep.equal([1, 2]);
  });
  it('works on triple', () => {
    const p = D.mkTupleValue([D.mkIntValue(1), D.mkIntValue(2), D.mkIntValue(3)]);
    expect(valueToJson(p)).to.deep.equal([1, 2, 3]);
  });
  it('works on nested tuple', () => {
    const p = D.mkTupleValue([
      D.mkTupleValue([D.mkIntValue(1), D.mkIntValue(2)]),
      D.mkIntValue(3),
    ]);
    expect(valueToJson(p)).to.deep.equal([[1, 2], 3]);
  });
  it('works on Agents', () => {
    const a: D.AgentValue = {
      class: 'ExternalObjectValue',
      externalObject: { tag: 'StringAgent', agentIdentifier: 'foo' },
    };
    expect(valueToJson(a)).to.deep.equal({
      externalObject: { agentIdentifier: 'foo' },
    });
  });
  it('works on CordaAgents', () => {
    const a: D.CordaAgentValue = {
      class: 'ExternalObjectValue',
      externalObject: { tag: 'CordaAgent', publicKeyBase58: 'foo', confidential: true },
    };
    expect(valueToJson(a)).to.deep.equal({
      externalObject: { publicKeyBase58: 'foo', confidential: true },
    });
  });
  it('works on ContractIds', () => {
    const c: D.ContractValue = {
      class: 'ExternalObjectValue',
      externalObject: { tag: 'StringContract', contractIdentifier: 'foo' },
    };
    expect(valueToJson(c)).to.deep.equal({
      externalObject: { contractIdentifier: 'foo' },
    });
  });

  it('works on PublicKeys', () => {
    const pem = `
-----BEGIN PUBLIC KEY-----
MFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAEFDpOIaItaN2oAaz4bVVMbFSq2jhYbpvS
JyFpzshkKrjg1Up82XtpOibzmfQTPF+h5iOq9dC/P+BqQwKkVUkU+A==
-----END PUBLIC KEY-----`;
    const pubk: D.PublicKeyValue = {
      class: 'ExternalObjectValue',
      externalObject: {
        publicKey: {
          pem,
          curveName: CurveName.SEC_p256k1,
          tag: 'ECDSAPublicKey',
        },
        tag: 'PublicKey',
      },
    };

    const epubk = Object.assign({}, pubk);
    delete epubk.class;
    delete epubk.externalObject.tag;

    expect(valueToJson(pubk)).to.deep.equal(epubk);
  });

  it('works on Signed', () => {
    const signed: D.SignedValue = {
      class: 'ExternalObjectValue',
      externalObject: {
        signedValue: {
          message: D.mkStringValue('We attack at dawn!'),
          sig: {
            tag: 'ECDSASignature',
            signature: {
              bytes: '8BADF00DCAFEC0DED00DBABEDEADBEEF',
            },
          },
        },
        tag: 'SignedValue',
      },
    };

    const esigned = Object.assign({}, signed);
    delete esigned.externalObject.tag;
    delete esigned.class;

    expect(valueToJson(signed)).to.deep.equal(esigned);
  });
});
