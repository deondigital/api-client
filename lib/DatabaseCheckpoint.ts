export namespace DatabaseCheckpoint {

  export interface Fresh {
    tag: 'Fresh';
  }
//   export interface At {
//     tag: 'At';
//     index: number;
//   };
}

export type DatabaseCheckpoint
  = DatabaseCheckpoint.Fresh;
//   | DatabaseCheckpoint.At;
