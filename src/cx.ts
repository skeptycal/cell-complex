export class cell_t <T> {
  constructor (
    public dimension: number,
    public id: number,
    public boundary: cell_complex_t <T>,
    public value?: T,
  ) {}
}

export class cell_complex_t <T> {
  constructor (
    public cells: Array <cell_t <T>>,
  ) {}
}
