import test from "ava"

import * as cx from "../dist/cx"

import {
  id_t, cmap_t, cell_t,
  cell_complex_t,
  spherical_complex_t
} from "../dist/cx"

test ("empty", t => {
  let empty = new cell_complex_t ()

  t.true (empty.point_set.size === 0)
  t.true (empty.cell_map.size === 0)
})

test ("singleton", t => {
  let singleton = new cell_complex_t ()

  let id_array = singleton.inc_points (1)

  t.true (id_array.length === 1)
  t.true (singleton.point_set.size === 1)
  t.true (singleton.cell_map.size === 0)
})

test.todo ("torus")
