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
    case 'TimeValue': return value.time;
    case 'PeriodValue': return value.period;
    case 'YearValue': return value.year;
    case 'YearMonthValue': return value.yearMonth;
    case 'DateValue': return value.date;
    case 'ZonedDateTimeValue': return value.zonedDateTime;
    case 'ZoneOffsetValue': return value.zoneOffset;
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
    case 'SetValue': {
      const tsSet = new Set();
      value.elements.forEach(e => tsSet.add(valueToJson(e)));
      return tsSet;
    }
    case 'TupleValue': return value.values.map(valueToJson);
    case 'ExternalObjectValue': {
      const obj = Object.assign({}, value);
      delete obj.class;
      delete obj.externalObject.tag;
      return obj;
    }
  }
};
