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

  eq (that: id_t): boolean {
    return ((this.dim === that.dim) &&
            (this.ser === that.ser))
  }

  toString (): string {
    return `${this.dim}:${this.ser}`
  }

  static parse (str: string): id_t {
    let words = str.split (":")
    let dim = parseInt (words [0])
    let ser = parseInt (words [1])
    return new id_t (dim, ser)
  }

  rev (): rev_id_t {
    return new rev_id_t (this.dim, this.ser)
  }
}

export
class continuous_map_t {
  readonly continuous_map_evidence
  : continuous_map_evidence_t

  readonly img: cell_complex_t

  constructor (
    readonly dom: cell_complex_t,
    readonly cod: cell_complex_t,
    readonly dic: dic_t <id_t, cell_complex_t>,
  ) {
    this.continuous_map_evidence =
      continuous_map_check (dom, cod, dic)
    this.img = cell_complex_t.merge_array (
      dic.value_array ())
  }
}

export
class continuous_map_evidence_t {
  constructor () {}
}

export
function continuous_map_check (
  dom: cell_complex_t,
  cod: cell_complex_t,
  dic: dic_t <id_t, cell_complex_t>,
): continuous_map_evidence_t {
  let evidence = new continuous_map_evidence_t ()
  // [todo]
  return evidence
}

export
class cell_t extends continuous_map_t {
  readonly boundary: spherical_complex_t

  constructor (
    dom: cell_complex_t,
    cod: cell_complex_t,
    dic: dic_t <id_t, cell_complex_t>,
  ) {
    super (dom, cod, dic)
    this.boundary = dom.as_spherical ()
  }

  dim (): number {
    return this.boundary.dim () + 1
  }
}

export
class cell_complex_t {
  /**
   * Points are special, because a point has not boundary.
   */
  protected point_array: Array <id_t>
  protected cell_dic: dic_t <id_t, cell_t>

  constructor (
    builder: cell_complex_builder_t =
      new cell_complex_builder_t ()
  ) {
    this.point_array = builder.point_array.slice ()
    this.cell_dic = builder.cell_dic.clone ()
  }

  dim (): number {
    let array = this.cell_dic.to_array ()
      .map (([id, _cell]) => id.dim)
    return Math.max (0, ...array)
  }

  has_point (id: id_t): boolean {
    return this.point_array.some ((x) => id.eq (x))
  }

  dim_of (id: id_t): number {
    if (this.has_point (id)) {
      return 0
    } else {
      return this.get_cell (id) .dim ()
    }
  }

  copy_point_array (): Array <id_t> {
    return this.point_array.slice ()
  }

  copy_cell_dic (): dic_t <id_t, cell_t> {
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

  has_cell (id: id_t): boolean {
    return this.cell_dic.has (id)
  }

  get_cell (id: id_t): cell_t {
    return this.cell_dic.get (id)
  }

  has (id: id_t): boolean {
    return this.has_point (id) || this.has_cell (id)
  }

  gen_id (dim: number): id_t {
    let ser: number
    if (dim === 0) {
      ser = 0
      for (let id of this.point_array) {
        ser = Math.max (ser, id.ser) + 1
      }
    } else {
      ser = 0
      for (let [id, _cell] of this.cell_dic.to_array ()) {
        if (id.dim === dim) {
          ser = Math.max (ser, id.ser) + 1
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

  as_spherical (): spherical_complex_t {
    return new spherical_complex_t (this)
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

  chain (id_array: Array <id_t>): chain_t {
    return new chain_t (this, id_array)
  }

  as_builder (): cell_complex_builder_t {
    let bui = new cell_complex_builder_t ()
    bui.point_array = this.copy_point_array ()
    bui.cell_dic = this.copy_cell_dic ()
    return bui
  }

  /**
   * Merging two complexes
   * only make sense when `this` and `that` are
   * both sub-complex of some larger complex.
   */
  merge (that: cell_complex_t): cell_complex_t {
    let bui = this.as_builder ()
    for (let id of that.copy_point_array ()) {
      if (!bui.has (id)) {
        bui.push_point (id)
      }
    }
    for (let [id, cell] of that.copy_cell_dic ()) {
      if (!bui.has (id)) {
        bui.set_cell (id, cell)
      }
    }
    return new cell_complex_t (bui)
  }

  static merge_array (
    com_array: Array <cell_complex_t>
  ): cell_complex_t {
    return com_array.reduce ((x, y) => x.merge (y))
  }
}

export
class cell_complex_builder_t {
  point_array: Array <id_t>
  cell_dic: dic_t <id_t, cell_t>

  constructor () {
    this.point_array = new Array ()
    this.cell_dic = new dic_t ()
  }

  push_point (id: id_t) {
    if (id.dim !== 0) {
      throw new Error ("dimension mismatch")
    } else {
      this.point_array.push (id)
    }
  }

  has_point (id: id_t): boolean {
    return this.point_array.some ((x) => id.eq (x))
  }

  set_cell (id: id_t, cell: cell_t) {
    this.cell_dic.set (id, cell)
  }

  has_cell (id: id_t): boolean {
    return this.cell_dic.has (id)
  }

  get_cell (id: id_t): cell_t {
    return this.cell_dic.get (id)
  }

  has (id: id_t): boolean {
    return this.has_point (id) || this.has_cell (id)
  }

  build (): cell_complex_t {
    return new cell_complex_t (this)
  }
}

export
class chain_t {
  constructor (
    readonly cell_complex: cell_complex_t,
    readonly id_array: Array <id_t>,
  ) {}

  closure (): cell_complex_t {
    let bui = new cell_complex_builder_t ()
    sub_complex_closure (
      this.cell_complex,
      this.id_array,
      bui)
    return bui.build ()
  }
}

function sub_complex_closure (
  com: cell_complex_t,
  id_array: Array <id_t>,
  bui: cell_complex_builder_t,
): void {
  for (let id of id_array) {
    if (bui.has (id)) {
      ////
    } else if (id.dim === 0) {
      bui.push_point (id)
    } else {
      let cell = com.get_cell (id)
      bui.set_cell (id, cell)
      let next = cell.img.copy_point_array () .concat (
        cell.img.copy_cell_dic () .key_array ())
      sub_complex_closure (com, next, bui)
    }
  }
}

export
class vertex_figure_t extends cell_complex_t {
  readonly com: cell_complex_t
  readonly vertex: id_t

  constructor (
    com: cell_complex_t,
    vertex: id_t,
  ) {
    let bui = new cell_complex_builder_t ()
    // [todo]
    super (bui)

    this.com = com
    this.vertex = vertex
  }
}

export
class bounfold_evidence_t {
  constructor () {}
}

function bounfold_check (
  cell_complex: cell_complex_t
): bounfold_evidence_t {
  let evidence = new bounfold_evidence_t ()
  // [todo]
  return evidence
}

/**
 * [[bounfold_t]] -- manifold with boundary
 */
export
class bounfold_t extends cell_complex_t {
  readonly bounfold_evidence
  : bounfold_evidence_t

  constructor (com: cell_complex_t) {
    super (com.as_builder ())
    this.bounfold_evidence = bounfold_check (this)
  }
}

export
class spherical_complex_evidence_t {
  constructor () {}
}

function spherical_complex_check (
  cell_complex: cell_complex_t
): spherical_complex_evidence_t {
  let evidence = new spherical_complex_evidence_t ()
  // [todo]
  return evidence
}

export
class spherical_complex_t extends cell_complex_t {
  readonly spherical_complex_evidence
  : spherical_complex_evidence_t

  constructor (com: cell_complex_t) {
    super (com.as_builder ())
    this.spherical_complex_evidence =
      spherical_complex_check (this)
  }
}

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

  idx (i: number): id_t {
    return this.point_array [i]
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
    let dom = start_and_end
    let dic = new dic_t <id_t, cell_complex_t> ()
    dic.set (
      start_and_end.start,
      com.chain ([start]) .closure ())
    dic.set (
      start_and_end.end,
      com.chain ([end]) .closure ())
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
class polygon_t extends cell_complex_t {
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

export
class face_t extends cell_t {
  circuit: circuit_t

  constructor (
    com: cell_complex_t,
    circuit: circuit_t,
  ) {
    let size = circuit.length
    let dom = new polygon_t (size)
    let dic = new dic_t <id_t, cell_complex_t> ()
    for (let i = 0; i < size; i += 1) {
      let src = dom.edge_array [i]
      let src_endpoints = dom.get_endpoints (src)
      let tar = circuit [i]
      let tar_endpoints = com.get_endpoints (tar)
      dic.set (
        src,
        com.chain ([tar]) .closure ())
      dic.set (
        src_endpoints.start,
        com.chain ([tar_endpoints.start]) .closure ())
      dic.set (
        src_endpoints.end,
        com.chain ([tar_endpoints.end]) .closure ())
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

//// 3 dimension
