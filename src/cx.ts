// for a class of spaces
//   we need to make sure that
//   spaces not meant to be in class is not constructable

export
interface id_t {
  dim: number,
  serial: number,
}

export
class cell_t {
  // a cell can only exist in the context of cell_complex
  constructor (
    public dim: number,
    public cell_complex: cell_complex_t,
    public boundary: spherical_complex_t,
    public attaching_map: Map <id_t, id_t>,
  ) {
    // the domain of a attaching_map
    //   is the boundary of a n_ball
    //   (we do not need explicit n_ball)
    // the boundary is a spherical_complex_t
    //   thus also is a cell_complex_t
    //   but this cell_complex is not part of
    //   the cell_complex we are constructing

    // every map is continuous
    // [todo] continuous_check
  }
}

function continuous_map_p (
  
  map: Map <id_t, id_t>,
): boolean {
  // [todo]
  return true
}

export
class cell_complex_t {
  constructor (
    public cells: Map <id_t, cell_t> = new Map (),
  ) {}
}

function spherical_complex_p (
  cell_complex: cell_complex_t
): boolean {
  // [todo]
  return true
}

export
class spherical_complex_t
extends cell_complex_t {
  spherical_p: true

  constructor (
    cell_complex: cell_complex_t,
  ) {
    super (cell_complex.cells)

    if (spherical_complex_p (cell_complex)) {
      this.spherical_p = true
    }
    else {
      throw new Error ("spherical check failed")
    }
  }
}
