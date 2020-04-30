import { Value } from './DeonData';
import { ExternalObject } from './ExternalObject';

const externalObjectValueToJson = (value: ExternalObject): {} => {
  switch (value.tag) {
    case 'StringAgent': return ({ agentIdentifier: value.agentIdentifier });
    case 'CordaAgent': return ({
      publicKeyBase58: value.publicKeyBase58,
      confidential: value.confidential,
    });
    case 'StringContract': return ({ contractIdentifier: value.contractIdentifier });
    default: {
      const obj = Object.assign({}, value);
      delete obj.tag;
      return obj;
    }
  }
};
/**
 * Flatten a `Value` object to its untyped JSON version,
 * stripping away type tags.
 *
 * @param value A Value object
 */
export const valueToJson = (value: Value): {} => {
  switch (value.class) {
    case 'IntValue': return value.i;
    case 'FloatValue': return value.d;
    case 'StringValue': return value.s;
    case 'BooleanValue': return value.b;
    case 'InstantValue': return value.instant;
    case 'DurationValue': return value.duration;
    case 'ConstructorValue': return {
      name: value.name,
      args: value.args.map(e => valueToJson(e)),
    };
    case 'RecordValue': return {
      recordTag: value.recordTag,
      fields: Object.assign({}, ...Object.keys(value.fields).map(
                k => ({ [k]: valueToJson(value.fields[k]) }))),
    };
    case 'ListValue': return value.elements.map(valueToJson);
    case 'MapValue': {
      const tsMap = new Map();
      value.elements.forEach(e => tsMap.set(valueToJson(e[0]), valueToJson(e[1])));
      return tsMap;
    }
    case 'TupleValue': return value.values.map(valueToJson);
    case 'ExternalObjectValue': {
      return ({ externalObject: externalObjectValueToJson(value.externalObject) });
    }
  }
};
