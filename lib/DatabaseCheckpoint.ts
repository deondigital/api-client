export namespace DatabaseCheckpoint {

  export interface Fresh {
    tag: 'Fresh';
  }
}

export type DatabaseCheckpoint
  = DatabaseCheckpoint.Fresh;
