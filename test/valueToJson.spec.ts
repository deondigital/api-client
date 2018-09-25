import { valueToJson } from '../lib/valueToJson';
import { Duration } from '../lib/ISO8601Duration';
import { expect } from 'chai';
import 'mocha';
import * as D from '../lib/DeonData';

describe('Fully typed to JSON typed', () => {
  it('works for IntValue', () => { expect(valueToJson(D.mkIntValue(42))).to.equal(42); });
  it('works for FloatValue', () => {
    expect(valueToJson(D.mkFloatValue(42.422))).to.equal(42.422);
  });
  it('works for StringValue', () => {
    expect(valueToJson(D.mkStringValue('hello there!'))).to.equal('hello there!');
  });
  it('works for BooleanValue', () => {
    expect(valueToJson(D.mkBooleanValue(true))).to.equal(true);
  });
  it('works for InstantValue', () => {
    const then = new Date('December 17, 1995 03:24:21');
    expect(valueToJson(D.mkInstantValue(then))).to.equal(then.toISOString());
  });
  it('works for DurationValue', () => {
    const dur: Duration = {
      years: 0, months: 0, days: 1, hours: 20, minutes: 44, seconds: 12.67901,
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
        [D.mkFloatValue(1.3)])]);
    expect(valueToJson(c)).to.deep.equal(
      {
        name: D.qual('C2'),
        args: [
          42,
          {
            name: { name: 'C1', qualifier: ['A', 'B'] },
            args: [1.3],
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
        b: D.mkFloatValue(789.43),
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
          b: 789.43,
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
      D.mkListValue([D.mkFloatValue(3.5), D.mkFloatValue(4.3)]),
    ]);
    expect(valueToJson(l)).to.deep.equal([[1, 2], [3.5, 4.3]]);
  });
  it('works on AgentValue', () => {
    const a: D.AgentValue = ({ identifier: 'foo', boundName: D.qual('a'), class: 'AgentValue' });
    expect(valueToJson(a)).to.deep.equal({ identifier: 'foo', boundName: D.qual('a') });
  });
  it('works on ContractIdValue', () => {
    const c: D.ContractIdValue =
    ({ class: 'ContractIdValue', identifier: 'foo', boundName: D.qual('a') });
    expect(valueToJson(c)).to.deep.equal({ identifier: 'foo', boundName: D.qual('a') });
  });
});
