// - for a class of spaces
//   we need to make sure that
//   spaces not meant to be in class is not constructable
// - to make a class easily inheritable
//   its constructor should not take arguments

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
    public boundary: spherical_complex_t,
    public cell_complex: cell_complex_t,
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
  point_array: Array <id_t>;
  cell_map: Map <id_t, cell_t>;

  constructor () {
    this.point_array = new Array ()
    this.cell_map = new Map ()
  }

  clone (): cell_complex_t {
    let cell_complex = new cell_complex_t ()
    cell_complex.point_array = this.point_array.slice ()
    cell_complex.cell_map = new Map (this.cell_map)
    return cell_complex
  }

  // skeleton (dim: number): cell_complex_t {
  //   [todo]
  // }

  gen_id (dim: number): id_t {
    let ser: number
    if (dim === 0) {
      ser = this.point_array.length
    } else {
      ser = 0
      for (let id of this.cell_map.keys ()) {
        if (id.dim === dim) {
          ser += 1
        }
      }
    }
    return new id_t (dim, ser)
  }

  add_points (n: number): Array <id_t> {
    let array: Array <id_t> = []
    let size = this.point_array.length
    for (let i = size;
         i < size + n;
         i += 1) {
      let id = new id_t (0, i)
      array.push (id)
    }
    this.point_array = this.point_array.concat (array)
    return array
  }

  add_cell (cell: cell_t): id_t {
    let id = this.gen_id (cell.dim)
    this.cell_map.set (id, cell)
    return id
  }

  spherical_p (): boolean {
    // [todo]
    return true
  }

  as_spherical (): spherical_complex_t {
    let spherical_complex = new spherical_complex_t ()
    spherical_complex.from_cell_complex (this)
    return spherical_complex
  }
}

export
class spherical_check_t {
  constructor () {}
}

export
class spherical_complex_t
extends cell_complex_t {
  info: {
    spherical_check: spherical_check_t
  }

  constructor () {
    super ()
    let spherical_check = new spherical_check_t ()
    this.info = { spherical_check }
  }

  // - self-builder
  from_cell_complex (
    cell_complex: cell_complex_t
  ): spherical_check_t {
    this.point_array = cell_complex.point_array
    this.cell_map = cell_complex.cell_map

    if (cell_complex.spherical_p ()) {
    } else {
      throw new Error ("spherical check failed")
    }

    return this
  }
}

// - use inheritance to specify more concrete constructions
//   and extends the interface to meet specific needs
// - since typescript has no multiple inheritance
//   we use explicit `.as_*` to mimic this missing feature

export
class empty_t
extends cell_complex_t {
  constructor () {
    super ()
  }
}

export
class discrete_space_t
extends cell_complex_t {
  constructor () {
    super ()
  }

  from_number (n: number): discrete_space_t {
    this.add_points (n)
    return this
  }

  idx (i: number): id_t {
    return this.point_array [i]
  }
}

export
class singleton_t
extends discrete_space_t {
  point: id_t

  constructor () {
    super ()
    this.from_number (1)
    this.point = this.idx (0)
  }
}

export
class start_and_end_t
extends discrete_space_t {
  start: id_t
  end: id_t

  constructor () {
    super ()
    this.from_number (2)
    this.start = this.idx (0)
    this.end = this.idx (1)
  }
}

export
class interval_t
extends cell_complex_t {
  arrow: id_t
  start: id_t
  end: id_t

  constructor () {
    super ()
    let start_and_end = new start_and_end_t ()
    let [start, end] = this.add_points (2)
    let dom = start_and_end.as_spherical ()
    let cod = this
    let cell = new cell_t (1, dom, cod, new Map ([
      [start_and_end.start, start],
      [start_and_end.end, end]
    ]))
    this.arrow = this.add_cell (cell)
    this.start = start
    this.end = end
  }
}

console.log (new interval_t ())
