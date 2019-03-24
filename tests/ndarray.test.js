import test from "ava"

import { ndarray_t } from "../dist/ndarray"

test ("shape_to_strides", t => {
  let shape = [2, 3, 4]
  let strides = ndarray_t.shape_to_strides (shape)
  t.deepEqual (strides, [12, 4, 1])
})

test ("new", t => {
  let shape = [3, 4]
  let strides = ndarray_t.shape_to_strides (shape)
  let buffer = new Float64Array (12)
  let x = new ndarray_t (buffer, shape, strides)
  t.true (x.get ([1, 2]) === 0)
  x.set ([1, 2], 666)
  t.true (x.get ([1, 2]) === 666)
  t.true (x.get ([0, 0]) === 0)
})

test ("from", t => {
  let x = ndarray_t.from_1darray ([0, 1, 2])
  t.true (x.get ([0]) === 0)
  t.true (x.get ([1]) === 1)
  t.true (x.get ([2]) === 2)
})
