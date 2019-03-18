// for a class of spaces
//   we need to make sure that
//   spaces not meant to be in class is not constructable

export
class n_ball_t {
  constructor (
    public dim: number,
    public boundary: spherical_complex_t,
  ) {}
}

// a cell can only exist in the context of cell_complex

export
class n_cell_t {
  dim: number

  constructor (
    public cell_complex: cell_complex_t,
    public n_ball: n_ball_t,
    public attaching_map: map_t,
  ) {
    this.dim = n_ball.dim
  }
}

// the domain of a attaching_map
//   is the boundary of a n_ball_t
//   which is a spherical_complex_t
//   which is a cell_complex_t
// this cell_complex is not part of the cell_complex
//   we are constructing

// every map is continuous

export
class continuous_check_t {
  // [todo]
}

export
class map_t {
  // [todo]
}

export
class cell_complex_t {
  constructor (
    public cells: Map <{ dim: number, id: number }, n_cell_t> = new Map (),
  ) {}
}

export
class spherical_check_t {
  // [todo]
}

export
class spherical_complex_t
extends cell_complex_t {

  constructor (
    public cell_complex: cell_complex_t,
    public spherical_check: spherical_check_t,
  ) {
    super (cell_complex.cells)
  }
}

let spherical_complex = new spherical_complex_t (
  new cell_complex_t (),
  new spherical_check_t ())
