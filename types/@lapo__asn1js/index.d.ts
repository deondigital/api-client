declare module '@lapo/asn1js' {
  export interface Stream {
    hexDump(start: number, end: number, raw: boolean): string;
  }
  export interface ASN1 {
    readonly stream: Stream;
    readonly sub: ASN1[] | null;
    posContent():number;
    posEnd():number;
  }
  export function decode(bindata: Uint8Array):ASN1;
}

declare module '@lapo/asn1js/base64' {
  export function unarmor(base64: string): Uint8Array;
}
