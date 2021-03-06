import test from "ava"

import { ndarray_t } from "../dist/ndarray"

test ("init_strides", t => {
  let shape = [2, 3, 4]
  let strides = ndarray_t.init_strides (shape)
  t.deepEqual (strides, [12, 4, 1])
})

test ("new", t => {
  let shape = [3, 4]
  let strides = ndarray_t.init_strides (shape)
  let buffer = new Float64Array (12)
  let x = new ndarray_t (buffer, shape, strides)
  t.true (x.get ([1, 2]) === 0)
  x.set ([1, 2], 666)
  t.true (x.get ([1, 2]) === 666)
  t.true (x.get ([0, 0]) === 0)
})

test ("from_1darray", t => {
  let x = ndarray_t.from_1darray ([0, 1, 2])
  t.true (x.get ([0]) === 0)
  t.true (x.get ([1]) === 1)
  t.true (x.get ([2]) === 2)
})

test ("from_2darray", t => {
  let x = ndarray_t.from_2darray ([[0, 1, 2], [3, 4, 5]])
  t.true (x.get ([0, 0]) === 0)
  t.true (x.get ([0, 1]) === 1)
  t.true (x.get ([0, 2]) === 2)
  t.true (x.get ([1, 0]) === 3)
  t.true (x.get ([1, 1]) === 4)
  t.true (x.get ([1, 2]) === 5)
})

test ("from_3darray", t => {
  let x = ndarray_t.from_3darray ([
    [[0, 1, 2], [3, 4, 5]],
    [[5, 4, 3], [2, 1, 0]],
  ])
  t.true (x.get ([0, 0, 0]) === 0)
  t.true (x.get ([0, 0, 1]) === 1)
  t.true (x.get ([0, 0, 2]) === 2)
  t.true (x.get ([0, 1, 0]) === 3)
  t.true (x.get ([0, 1, 1]) === 4)
  t.true (x.get ([0, 1, 2]) === 5)
  t.true (x.get ([1, 0, 0]) === 5)
  t.true (x.get ([1, 0, 1]) === 4)
  t.true (x.get ([1, 0, 2]) === 3)
  t.true (x.get ([1, 1, 0]) === 2)
  t.true (x.get ([1, 1, 1]) === 1)
  t.true (x.get ([1, 1, 2]) === 0)
})

test ("from_buffer", t => {
  let x = ndarray_t.from_buffer (
    [2, 2, 3],
    Float64Array.from ([
      0, 1, 2,  3, 4, 5,
      5, 4, 3,  2, 1, 0,
    ]))
  t.true (x.get ([0, 0, 0]) === 0)
  t.true (x.get ([0, 0, 1]) === 1)
  t.true (x.get ([0, 0, 2]) === 2)
  t.true (x.get ([0, 1, 0]) === 3)
  t.true (x.get ([0, 1, 1]) === 4)
  t.true (x.get ([0, 1, 2]) === 5)
  t.true (x.get ([1, 0, 0]) === 5)
  t.true (x.get ([1, 0, 1]) === 4)
  t.true (x.get ([1, 0, 2]) === 3)
  t.true (x.get ([1, 1, 0]) === 2)
  t.true (x.get ([1, 1, 1]) === 1)
  t.true (x.get ([1, 1, 2]) === 0)
})

test ("proj", t => {
  let y = ndarray_t.from_3darray ([
    [[0, 1, 2], [3, 4, 5]],
    [[5, 4, 3], [2, 1, 0]],
  ])

  {
    let x = y.proj ([0, undefined, undefined])
    t.true (x.get ([0, 0]) === 0)
    t.true (x.get ([0, 1]) === 1)
    t.true (x.get ([0, 2]) === 2)
    t.true (x.get ([1, 0]) === 3)
    t.true (x.get ([1, 1]) === 4)
    t.true (x.get ([1, 2]) === 5)
  }

  {
    let x = y.proj ([0, undefined, 0])
    t.true (x.get ([0]) === 0)
    t.true (x.get ([1]) === 3)
    x = x.copy ()
    t.true (x.get ([0]) === 0)
    t.true (x.get ([1]) === 3)
  }

  {
    let x = y.proj ([1, undefined, undefined])
    t.true (x.get ([0, 0]) === 5)
    t.true (x.get ([0, 1]) === 4)
    t.true (x.get ([0, 2]) === 3)
    t.true (x.get ([1, 0]) === 2)
    t.true (x.get ([1, 1]) === 1)
    t.true (x.get ([1, 2]) === 0)
  }

  {
    let x = y.proj ([1, undefined, 2])
    t.true (x.get ([0]) === 3)
    t.true (x.get ([1]) === 0)
    x = x.copy ()
    t.true (x.get ([0]) === 3)
    t.true (x.get ([1]) === 0)
  }
})

test ("slice", t => {
  let y = ndarray_t.from_3darray ([
    [[0, 1, 2], [3, 4, 5]],
    [[5, 5, 0], [6, 6, 0]],
    [[5, 4, 3], [2, 1, 0]],
  ])

  {
    let x = y
        .proj ([1, undefined, undefined])
        .slice ([undefined, [0, 2]])
    t.true (x.get ([0, 0]) === 5)
    t.true (x.get ([0, 1]) === 5)
    t.true (x.get ([1, 0]) === 6)
    t.true (x.get ([1, 1]) === 6)
    x = x.copy ()
    t.true (x.get ([0, 0]) === 5)
    t.true (x.get ([0, 1]) === 5)
    t.true (x.get ([1, 0]) === 6)
    t.true (x.get ([1, 1]) === 6)
  }

  {
    let x = y
        .slice ([undefined, undefined, [0, 2]])
        .proj ([1, undefined, undefined])
    t.true (x.get ([0, 0]) === 5)
    t.true (x.get ([0, 1]) === 5)
    t.true (x.get ([1, 0]) === 6)
    t.true (x.get ([1, 1]) === 6)
    x = x.copy ()
    t.true (x.get ([0, 0]) === 5)
    t.true (x.get ([0, 1]) === 5)
    t.true (x.get ([1, 0]) === 6)
    t.true (x.get ([1, 1]) === 6)
  }
})
