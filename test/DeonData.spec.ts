import { expect } from 'chai';
import 'mocha';
import { qual } from '../lib/DeonData';

describe('QualifiedName', () => {
  it('qualified named with no module', () => {
    expect(qual('A')).to.deep.equal({ name: 'A', qualifier: [] });
  });
  it('qualified name with module', () => {
    expect(qual('A::a')).to.deep.equal({ name: 'a', qualifier: ['A'] });
  });
});
