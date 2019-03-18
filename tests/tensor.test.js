import test from "ava"

import * as tensor from "../dist/tensor"

test ("new", t => {
  let shape = [3, 4]
  let buffer = new Float64Array (12)
  let x = new tensor.tensor_t (shape, buffer)
  t.true (x.idx ([1, 2]) === 0)
  x.put ([1, 2], 666)
  t.true (x.idx ([1, 2]) === 666)
  t.true (x.idx ([0, 0]) === 0)
})

test ("cons", t => {
  let x = tensor.c1d ([0, 1, 2])
  t.true (x.idx ([0]) === 0)
  t.true (x.idx ([1]) === 1)
  t.true (x.idx ([2]) === 2)
})
