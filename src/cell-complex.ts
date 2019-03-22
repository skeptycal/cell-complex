import { dic_t } from "./dic"

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

  toString (): string {
    return [this.dim, this.ser] .toString ()
  }

  static parse (str: string): id_t {
    let words = str.split (",")
    let dim = parseInt (words [0])
    let ser = parseInt (words [1])
    return new id_t (dim, ser)
  }

  rev (): rev_id_t {
    return new rev_id_t (this.dim, this.ser)
  }
}

export
class cmap_t {
  /**
   * "cmap" is a short for "continuous map".
   */
  constructor (
    readonly dom: cell_complex_t,
    readonly cod: cell_complex_t,
    readonly dic: dic_t <id_t, id_t>,
  ) {
    if (continuous_map_p (dom, cod, dic)) {
      ////
    } else {
      throw new Error ("continuous check failed")
    }
  }

  get (id: id_t) {
    return this.dic.get (id)
  }
}

export
function continuous_map_p (
  dom: cell_complex_t,
  cod: cell_complex_t,
  dic: dic_t <id_t, id_t>,
): boolean {
  // [todo]
  return true
}

export
class cell_t extends cmap_t {
  constructor (
    readonly boundary: spherical_complex_t,
    readonly cell_complex: cell_complex_t,
    readonly attaching: dic_t <id_t, id_t>,
  ) {
    super (boundary, cell_complex, attaching)
  }

  dim (): number {
    return this.boundary.dim () + 1
  }
}

/**
 * The interface functions for side-effects are protected.
 * After constructed, a cell-complex_t is pure.
 */
export
class cell_complex_t {
  /**
   * Points are special, because a point has not boundary.
   */
  protected point_array: Array <id_t>
  protected cell_dic: dic_t <id_t, cell_t>

  constructor () {
    this.point_array = new Array ()
    this.cell_dic = new dic_t ()
  }

  get_cell_id_array (): Array <id_t> {
    let array = new Array <id_t> ()
    for (let [id, _cell] of this.cell_dic.to_array ()) {
      array.push (id)
    }
    return array
  }

  dim (): number {
    let array = this.get_cell_id_array () .map (id => id.dim)
    return Math.max (0, ...array)
  }

  get_point_array (): Array <id_t> {
    return this.point_array.slice ()
  }

  get_cell_dic (): dic_t <id_t, cell_t> {
    return this.cell_dic.clone ()
  }

  clone (): cell_complex_t {
    let com = new cell_complex_t ()
    com.point_array = this.point_array.slice ()
    com.cell_dic = this.cell_dic.clone ()
    return com
  }

  skeleton (dim: number): cell_complex_t {
    let com = new cell_complex_t ()
    com.point_array = this.point_array.slice ()
    for (let [id, cell] of this.cell_dic.to_array ()) {
      if (id.dim <= dim) {
        com.cell_dic.set (id, cell)
      }
    }
    return com
  }

  idx (i: number): id_t {
    return this.point_array [i]
  }

  has_cell (id: id_t): boolean {
    return this.cell_dic.has (id)
  }

  get_cell (id: id_t): cell_t {
    return this.cell_dic.get (id)
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
      for (let id of this.get_cell_id_array ()) {
        if (id.dim === dim) {
          ser += 1
        }
      }
    }
    return new id_t (dim, ser)
  }

  protected inc_points (n: number): Array <id_t> {
    let array = new Array <id_t> ()
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

  protected attach (cell: cell_t): id_t {
    let id = this.gen_id (cell.dim ())
    this.cell_dic.set (id, cell)
    return id
  }

  protected attach_edge (start: id_t, end: id_t): id_t {
    return this.attach (new edge_t (this, start, end))
  }

  protected attach_face (circuit: circuit_t): id_t {
    return this.attach (new face_t (this, circuit))
  }

  spherical_p (): boolean {
    // [todo]
    return true
  }

  as_spherical (): spherical_complex_t {
    let spherical_complex = new spherical_complex_t (this)
    return spherical_complex
  }

  get_edge (id: id_t): edge_t {
    if (id.dim !== 1) {
      throw new Error ("dimension mismatch")
    } else {
      return this.get_cell (id) as edge_t
    }
  }

  get_endpoints (id: id_t): { start: id_t, end: id_t } {
    let edge = this.get_edge (id)
    if (id instanceof rev_id_t) {
      return { start: edge.end, end: edge.start }
    } else {
      return { start: edge.start, end: edge.end }
    }
  }
}

// export
// class product_complex_t extends cell_complex_t {
//   constructor () {}
// }

export
class spherical_complex_evidence_t {
  spherical_complex_evidence: string

  constructor () {
    this.spherical_complex_evidence = "[todo]"
  }
}

export
class spherical_complex_t extends cell_complex_t {
  info: {
    spherical_complex_evidence: spherical_complex_evidence_t
  }

  constructor (
    cell_complex: cell_complex_t = new cell_complex_t ()
  ) {
    super ()
    if (cell_complex.spherical_p ()) {
      this.point_array = cell_complex.get_point_array ()
      this.cell_dic = cell_complex.get_cell_dic ()
      let spherical_complex_evidence = new spherical_complex_evidence_t ()
      this.info = { spherical_complex_evidence }
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

/**
 * Although cell-complex is recursively defined,
 * but each dimension has its own special features.
 * For example, the only possible 1-cell is [[edge_t]].
 */
export
class edge_t extends cell_t {
  start: id_t
  end: id_t

  constructor (
    com: cell_complex_t,
    start: id_t,
    end: id_t,
  ) {
    let start_and_end = new start_and_end_t ()
    let dom = start_and_end.as_spherical ()
    let dic = new dic_t <id_t, id_t> () .set_array ([
      [start_and_end.start, start],
      [start_and_end.end, end],
    ])
    super (dom, com, dic)
    this.start = start
    this.end = end
  }
}

export
class interval_t extends cell_complex_t {
  readonly start: id_t
  readonly end: id_t
  readonly inter: id_t

  constructor () {
    super ()
    let [start, end] = this.inc_points (2)
    this.start = start
    this.end = end
    this.inter = this.attach_edge (start, end)
  }
}

export
class polygon_t extends spherical_complex_t {
  edge_array: Array <id_t>
  size: number

  constructor (n: number) {
    super ()
    this.size = n
    let point_array = this.inc_points (n)
    this.edge_array = []
    let i = 0
    while (i < n - 1) {
      this.edge_array.push (
        this.attach_edge (point_array [i], point_array [i + 1]))
      i += 1
    }
    this.edge_array.push (
      this.attach_edge (point_array [n - 1], point_array [0]))
  }
}

//// 2 dimension

export
class rev_id_t extends id_t {
  constructor (
    readonly dim: number,
    readonly ser: number,
  ) {
    super (dim, ser)
  }
}

type circuit_t = Array <id_t>

// [todo] refactor face_t constructor
export
class face_t extends cell_t {
  circuit: circuit_t

  constructor (
    com: cell_complex_t,
    circuit: circuit_t,
  ) {
    let size = circuit.length
    let dom = new polygon_t (size)
    let dic = new dic_t <id_t, id_t> ()
    for (let i = 0; i < size; i += 1) {
      let src = dom.edge_array [i]
      let src_endpoints = dom.get_endpoints (src)
      let tar = circuit [i]
      let tar_endpoints = com.get_endpoints (tar)
      dic.set (src, tar)
      dic.set (src_endpoints.start, tar_endpoints.start)
      dic.set (src_endpoints.end, tar_endpoints.end)
    }
    super (dom, com, dic)
    this.circuit = circuit
  }
}

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
    this.polo = this.attach_edge (origin, origin)
    this.toro = this.attach_edge (origin, origin)
    this.surf = this.attach_face ([
      this.polo, this.toro,
      this.polo.rev (), this.toro.rev (),
    ])
  }
}

console.log (new torus_t ())

//// 3 dimension
