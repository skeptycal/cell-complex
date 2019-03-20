/**
 * In the context of a [[cell_complex_t]],
 * The dimension and a serial number can identify a cell.
 */
export
class id_t {
  constructor (
    readonly dim: number,
    readonly ser: number,
  ) {}
}

export
class cmap_t {
  /**
   * A `map` is just a js [[Map]],
   * while a `cmap` (continuous-map) can only exists
   * in the context of its domain and codomain.
   */
  constructor (
    readonly dom: cell_complex_t,
    readonly cod: cell_complex_t,
    readonly map: Map <id_t, id_t>,
  ) {
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
class cell_t extends cmap_t {
    /**
     * The domain of a `attaching_map`
     * is the `boundary` of a n-ball.
     * But practically, we do not need an explicit n-ball.
     */
  constructor (
    public dim: number,
    public boundary: spherical_complex_t,
    public cell_complex: cell_complex_t,
    public attaching_map: Map <id_t, id_t>,
  ) {
    super (boundary, cell_complex, attaching_map)
  }
}

/**
 * The interface functions for side-effects are protected.
 * After constructed, a cell-complex_t is pure.
 */
export
class cell_complex_t {
  protected point_array: Array <id_t>;
  protected cell_map: Map <id_t, cell_t>;

  constructor () {
    this.point_array = new Array ()
    this.cell_map = new Map ()
  }

  get_point_array (): Array <id_t> {
    return this.point_array.slice ()
  }

  get_cell_map (): Map <id_t, cell_t> {
    return new Map (this.cell_map)
  }

  clone (): cell_complex_t {
    let com = new cell_complex_t ()
    com.point_array = this.point_array.slice ()
    com.cell_map = new Map (this.cell_map)
    return com
  }

  skeleton (dim: number): cell_complex_t {
    let com = new cell_complex_t ()
    com.point_array = this.point_array.slice ()
    for (let [id, cell] of this.cell_map) {
      if (id.dim <= dim) {
        com.cell_map.set (id, cell)
      }
    }
    return com
  }

  idx (i: number): id_t {
    return this.point_array [i]
  }

  has_cell (id: id_t): boolean {
    return this.cell_map.has (id)
  }

  get_cell (id: id_t): cell_t {
    let cell = this.cell_map.get (id)
    if (cell === undefined) {
      throw new Error ("no such id")
    } else {
      return cell
    }
  }

  // product (that: cell_complex_t): product_complex_t {
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

  protected inc_points (n: number): Array <id_t> {
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

  protected add_cell (cell: cell_t): id_t {
    let id = this.gen_id (cell.dim)
    this.cell_map.set (id, cell)
    return id
  }

  spherical_p (): boolean {
    // [todo]
    return true
  }

  as_spherical (): spherical_complex_t {
    let spherical_complex = new spherical_complex_t (this)
    return spherical_complex
  }

  protected attach (
    dim: number,
    boundary: spherical_complex_t,
    attaching_map: Map <id_t, id_t>,
  ): id_t {
    return this.add_cell (
      new cell_t (dim, boundary, this, attaching_map))
  }
}

// export
// class product_complex_t extends cell_complex_t {
//   constructor () {}
// }

export
class spherical_evidence_t {
  spherical_evidence: string

  constructor () {
    this.spherical_evidence = "[todo]"
  }
}

export
class spherical_complex_t extends cell_complex_t {
  info: {
    spherical_evidence: spherical_evidence_t
  }

  constructor (
    cell_complex: cell_complex_t = new cell_complex_t ()
  ) {
    super ()
    if (cell_complex.spherical_p ()) {
      this.point_array = cell_complex.get_point_array ()
      this.cell_map = cell_complex.get_cell_map ()
      let spherical_evidence = new spherical_evidence_t ()
      this.info = { spherical_evidence }
    } else {
      throw new Error ("spherical check failed")
    }
  }
}

// Since typescript has no multiple inheritance,
// we use explicit `.as_*` to mimic this missing feature.

//// 0 dimension

export
class empty_t extends cell_complex_t {
  constructor () {
    super ()
  }
}

export
class discrete_complex_t extends cell_complex_t {
  constructor () {
    super ()
  }

  from_number (n: number): discrete_complex_t {
    this.inc_points (n)
    return this
  }
}

export
class singleton_t extends discrete_complex_t {
  readonly point: id_t

  constructor () {
    super ()
    this.from_number (1)
    this.point = this.idx (0)
  }
}

export
class start_and_end_t extends discrete_complex_t {
  readonly start: id_t
  readonly end: id_t

  constructor () {
    super ()
    this.from_number (2)
    this.start = this.idx (0)
    this.end = this.idx (1)
  }
}

//// 1 dimension

export
class interval_t extends cell_complex_t {
  readonly start: id_t
  readonly end: id_t
  readonly arrow: id_t

  constructor () {
    super ()
    let [start, end] = this.inc_points (2)
    this.start = start
    this.end = end
    let start_and_end = new start_and_end_t ()
    this.arrow = this.attach (
      1, start_and_end.as_spherical (),
      new Map ([
        [start_and_end.start, start],
        [start_and_end.end, end],
      ]))
  }
}

export
class polygon_t extends spherical_complex_t {
  constructor (n: number) {
    super ()
  }
}

//// 2 dimension

export
class torus_t extends cell_complex_t {
  readonly origin: id_t
  readonly polo: id_t
  readonly toro: id_t
  readonly surf: id_t

  constructor () {
    super ()

    let [origin] = this.inc_points (1)
    this.origin = origin

    let start_and_end = new start_and_end_t ()
    this.polo = this.attach (
      1, start_and_end.as_spherical (),
      new Map ([
        [start_and_end.start, origin],
        [start_and_end.end, origin],
      ]))
    this.toro = this.attach (
      1, start_and_end.as_spherical (),
      new Map ([
        [start_and_end.start, origin],
        [start_and_end.end, origin],
      ]))

    let quadrilateral = new cell_complex_t ()
    this.surf = this.attach (
      2, quadrilateral.as_spherical (),
      new Map ([

      ]))
  }
}

//// 3 dimension
