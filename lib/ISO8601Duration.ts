/**
 * @description A module for parsing ISO8601 durations
 * @author Tobias Lunding (original)
 * @author Adam Schønemann, Bjørn Bugge Grathwohl
 * I've adapted it to typescript. Could not use as dependency as downstream
 * deps would not include the typescript defs.
 * Changed Duration representation to be a class.
 */

export class Duration {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;

  constructor(days: number, hours: number, minutes: number, seconds: number) {
    this.days = days;
    this.hours = hours;
    this.minutes = minutes;
    this.seconds = seconds;
  }

  static construct(r: { days: number; hours: number; minutes: number; seconds: number }) {
    return new Duration(r.days, r.hours, r.minutes, r.seconds);
  }

  equals(other: any): boolean {
    if (other === this) return true;
    if (other instanceof Duration) {
      return this.days === other.days
        && this.hours === other.hours
        && this.minutes === other.minutes
        && this.seconds === other.seconds;
    }
    return false;
  }

  hashCode(): number {
    let hash = this.days | 0;
    hash = ((hash << 5) - hash + this.hours) | 0;
    hash = ((hash << 5) - hash + this.minutes) | 0;
    return ((hash << 5) - hash + this.seconds) | 0;
  }
}

/**
 * The pattern used for parsing ISO8601 duration (PnDTnHnMnS).
 * This does not cover the week format PnW.
 */

// PnDTnHnMnS
const numbers = '\\d+(?:[\\.,]\\d{0,3})?';
const datePattern = `(${numbers}D)?`;
const timePattern = `T(${numbers}H)?(${numbers}M)?(${numbers}S)?`;

const iso8601 = `^P(?:${datePattern}(?:${timePattern})?)$`;

/**
 * The ISO8601 regex for matching / testing durations
 */
export const pattern = new RegExp(iso8601);

/**
 * Parse PnYnMnDTnHnMnS format to object.  Note that the 'seconds' component only
 * allows for a precision of up to three decimal places.
 *
 * @param  durationString - PnYnMnDTnHnMnS formatted string
 * @return With a property for each part of the pattern
 */
export const parse = (durationString: string): Duration | undefined => {
  // Slice away first entry in match-array
  const matches = durationString.match(pattern);
  if (!matches || matches.filter(x => typeof x !== 'undefined').length < 2) {
    return undefined;
  }
  return Duration.construct({
    days: parseFloat(matches[1]) || 0,
    hours: parseFloat(matches[2]) || 0,
    minutes: parseFloat(matches[3]) || 0,
    seconds: parseFloat(matches[4]) || 0,
  });
};

/**
 * Convert ISO8601 duration object to seconds
 * Caution: Uses year = 365 days, month = 30 days
 * @param  duration - The duration object
 * @return
 */
export const toSeconds = (duration: Duration): number => {
  const { days, hours, minutes, seconds } = duration;
  const minScale = 60;
  const hourScale = minScale * 60;
  const dayScale = hourScale * 24;
  return (
    days * dayScale
    + hours * hourScale
    + minutes * minScale
    + seconds
  );
};

/**
 * Takes a Duration object and turns into an ISO8601 duration string, e.g.
 * P1DT2H33M15.001S (1 day, 2 hours, 33 minutes, 15.001 seconds)
 * @param d
 */
export const durationToISOString = (d: Duration): string => {
  const fmt = (f: string) => (x: number) => x !== 0 ? x.toString() + f : '';
  const { days, hours, minutes, seconds } = d;
  const datestr = fmt('D')(days);
  const timestr = fmt('H')(hours) + fmt('M')(minutes) + fmt('S')(seconds);
  const ret = datestr + (timestr.length > 0 ? `T${timestr}` : '');
  return `P${ret.length > 0 ? ret : '0S'}`;
};
