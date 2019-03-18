// strides based row-major ndarray of number

export type Array1d = Array <number>
export type Array2d = Array <Array <number>>
export type Array3d = Array <Array <Array <number>>>

export
class tensor_t {
  dim: number
  size: number
  strides: Array <number>

  constructor (
    public shape: Array <number>,
    public buffer: Float64Array,
  ) {
    this.dim = shape.length
    this.size = shape.reduce ((acc, cur) => acc * cur)
    this.strides = shape_to_strides (shape)

    if (this.size !== buffer.length) throw new Error (
      `new tensor_t -- buffer.length mismatch \n` +
        `this.shape = ${ this.shape } \n` +
        `buffer.length = ${ buffer.length } \n` +
        `buffer.length should be ${ this.size } \n`
    )
  }

  index_to_offset (index: Array <number>): number {
    let offset = 0
    for (let i = 0; i < index.length; i += 1) {
      offset += index [i] * this.strides [i]
    }
    return offset
  }

  idx (index: Array <number>): number {
    return this.buffer [this.index_to_offset (index)]
  }

  put (index: Array <number>, x: number) {
    this.buffer [this.index_to_offset (index)] = x
  }

  // proj ()
  // put_proj ()
  // clone ()
  // deep_clone ()
}

export
function shape_to_strides (shape: Array <number>): Array <number> {
  let strides: Array <number> = []
  let acc = 1
  shape.slice () .reverse () .forEach ((x) => {
    strides.push (acc)
    acc *= x
  })
  return strides.reverse ()
}

export
function c1d (array: Array1d): tensor_t {
  let shape = [array.length]
  let buffer = Float64Array.from (array)
  return new tensor_t (shape, buffer)
}

// export
// function c2d (array: Array2d): tensor_t {
//   return new tensor_t ()
// }

// export
// function c3d (array: Array3d): tensor_t {
//   return new tensor_t ()
// }
