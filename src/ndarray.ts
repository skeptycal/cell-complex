export type Array1d = Array <number>
export type Array2d = Array <Array <number>>
export type Array3d = Array <Array <Array <number>>>

/**
 * strides based row-major ndarray of number
 */
export
class ndarray_t {
  readonly size: number

  constructor (
    protected buffer: Float64Array,
    readonly shape: Array <number>,
    readonly strides: Array <number>,
    readonly offset: number = 0,
  ) {
    this.size = shape.reduce ((acc, cur) => acc * cur)
  }

  static shape_to_strides (
    shape: Array <number>
  ): Array <number> {
    let strides: Array <number> = []
    let acc = 1
    shape.slice () .reverse () .forEach ((x) => {
      strides.push (acc)
      acc *= x
    })
    return strides.reverse ()
  }

  get_linear_index (index: Array <number>): number {
    let linear_index = this.offset
    for (let i = 0; i < index.length; i += 1) {
      linear_index += index [i] * this.strides [i]
    }
    return linear_index
  }

  get (index: Array <number>): number {
    return this.buffer [this.get_linear_index (index)]
  }

  set (index: Array <number>, x: number) {
    this.buffer [this.get_linear_index (index)] = x
  }

  protected linear_index_valid_p (i: number): boolean {
    i -= this.offset
    for (let [n, s] of this.strides.entries ()) {
      if (Math.floor (i / s) >= this.shape [n]) {
        return false
      } else {
        i = i % s
      }
    }
    return true
  }

  copy (): ndarray_t {
    let buffer = new Float64Array (this.size)
    let i = 0
    for (let k of this.buffer.keys ()) {
      if (this.linear_index_valid_p (k)) {
        buffer [i] = this.buffer [k]
        i += 1
      }
    }
    return new ndarray_t (
      buffer, this.shape,
      ndarray_t.shape_to_strides (this.shape))
  }

  porj (index: Array <number | undefined>): ndarray_t {
    let shape = new Array <number> ()
    let strides = new Array <number> ()
    let offset = this.offset
    for (let [k, v] of index.entries ()) {
      if (v === undefined) {
        shape.push (this.shape [k])
        strides.push (this.strides [k])
      } else {
        offset += v * this.strides [k]
      }
    }
    return new ndarray_t (this.buffer, shape, strides, offset)
  }

  slice (index: Array <[number, number] | undefined>): ndarray_t {
    let shape = this.shape
    let offset = this.offset
    for (let [k, v] of index.entries ()) {
      if (v === undefined) {
      } else {
        let [start, end] = v
        shape [k] = end - start
        offset += start * this.strides [k]
      }
    }
    return new ndarray_t (this.buffer, shape, this.strides, offset)
  }

  static from_1darray (array: Array1d): ndarray_t {
    let buffer = Float64Array.from (array)
    let shape = [array.length]
    let strides = ndarray_t.shape_to_strides (shape)
    return new ndarray_t (buffer, shape, strides)
  }
}
