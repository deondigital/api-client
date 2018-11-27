
declare module 'json-stringify-deterministic' {
  export type Options = {
    stringify(obj: any):any;
  }
  export default function (obj: any, opts: Options): string;
}
