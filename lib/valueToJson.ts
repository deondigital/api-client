import { Value } from './DeonData';

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
    case 'ListValue': return value.elements.map(e => valueToJson(e));
    case 'AgentValue': return {
      identifier: value.identifier,
      boundName: value.boundName,
    };
  }
};
