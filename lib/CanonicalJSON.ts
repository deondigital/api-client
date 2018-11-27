// tslint:disable-next-line:import-name
import stringify from 'json-stringify-deterministic';

export function noExponents(num: number) {
  const data = String(num).split(/[eE]/);
  if (data.length === 1) {
    return data[0];
  }

  let z = '';
  const sign = num < 0 ? '-' : '';
  const str = data[0].replace('.', '');
  let mag = Number(data[1]) + 1;

  if (mag < 0) {
    z = `${sign}${'0.'}`;
    // tslint:disable-next-line:no-increment-decrement
    while (mag++) {
      z += '0';
    }
    return z + str.replace(/^\-/, '');
  }
  mag -= str.length;
  // tslint:disable-next-line:no-increment-decrement
  while (mag--) {
    z += '0';
  }
  return str + z;
}

const opts = {
  stringify(obj:any) {
    if (typeof obj !== 'number') {
      return JSON.stringify(obj);
    }
    return noExponents(obj);
  },
};

export function stringifyCanonically(obj:any) {
  return stringify(obj, opts);
}
