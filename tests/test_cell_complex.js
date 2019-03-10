import test from "ava"

import { cell_complex_t, cell_t } from "@xieyuheng/cx"

test ("torus", t => {
  let o = new cell_t (0, 0, new cell_complex_t ([]))
  let p = new cell_t (1, 0, new cell_complex_t ([o, o]))
  let q = new cell_t (1, 1, new cell_complex_t ([o, o]))
  let m = new cell_t (2, 0, new cell_complex_t ([p, q, p, q]))
  console.log (m)
  t.pass ()
})
