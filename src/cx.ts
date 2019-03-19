// for a class of spaces
//   we need to make sure that
//   spaces not meant to be in class is not constructable

export
class id_t {
  constructor (
    public dim: number,
    public ser: number,
  ) {}
}

export
class cmap_t {
  // a map is just a js Map,
  // a cmap exists in the context of domain and codomain
  constructor (
    public dom: cell_complex_t,
    public cod: cell_complex_t,
    public map: Map <id_t, id_t>,
  ) {
    // every map is continuous
    if (continuous_map_p (dom, cod, map)) {
      ////
    } else {
      throw new Error ("continuous check failed")
    }
  }
}

export
function continuous_map_p (
  dom: cell_complex_t,
  cod: cell_complex_t,
  map: Map <id_t, id_t>,
): boolean {
  // [todo]
  return true
}

export
class cell_t
extends cmap_t {
  constructor (
    public dim: number,
    public cell_complex: cell_complex_t,
    public boundary: spherical_complex_t,
    public attaching_map: Map <id_t, id_t>,
  ) {
    super (boundary, cell_complex, attaching_map)
    // the domain of a attaching_map
    //   is the boundary of a n_ball
    //   (we do not need explicit n_ball)
    // the boundary is a spherical_complex_t
    //   thus also is a cell_complex_t
    //   but this cell_complex is not part of
    //   the cell_complex we are constructing
  }
}

export
class cell_complex_t {
  point_set: Set <id_t>;
  cell_map: Map <id_t, cell_t>;

  constructor () {
    this.point_set = new Set ()
    this.cell_map = new Map ()
  }

  clone (): cell_complex_t {
    let cell_complex = new cell_complex_t ()
    cell_complex.point_set = new Set (this.point_set)
    cell_complex.cell_map = new Map (this.cell_map)
    return cell_complex
  }

  inc_points (n: number): Array <id_t> {
    let array: Array <id_t> = []
    let size = this.point_set.size
    for (let i = size;
         i < size + n;
         i += 1) {
      let id = new id_t (0, i)
      this.point_set.add (id)
      array.push (id)
    }
    return array
  }
}

export
class spherical_complex_t
extends cell_complex_t {
  info: {
    spherical_p: true
  }

  constructor (
    cell_complex: cell_complex_t,
  ) {
    super ()
    this.point_set = cell_complex.point_set
    this.cell_map = cell_complex.cell_map

    if (spherical_complex_p (cell_complex)) {
      this.info = { spherical_p: true }
    } else {
      throw new Error ("spherical check failed")
    }
  }
}

export
function spherical_complex_p (
  cell_complex: cell_complex_t
): boolean {
  // [todo]
  return true
}

// [todo] skeleton
