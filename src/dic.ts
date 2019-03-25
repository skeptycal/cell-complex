/**
 * Map with `.toString ()` value as key.
 */
export
class dic_t <K , V> {
  protected val_map: Map <string, V>
  protected key_map: Map <string, K>

  constructor () {
    this.val_map = new Map ()
    this.key_map = new Map ()
  }

  set (k: K, v: V): void {
    let s = k.toString ()
    this.val_map.set (s, v)
    this.key_map.set (s, k)
  }

  has (k: K): boolean {
    let s = k.toString ()
    return this.val_map.has (s)
  }

  get (k: K): V {
    let s = k.toString ()
    let v = this.val_map.get (s)
    if (v === undefined) {
      throw new Error ("key no in dic")
    }
    return v
  }

  to_array (): Array <[K, V]> {
    let array = new Array <[K, V]> ()
    for (let [s, v] of this.val_map) {
      let k = this.key_map.get (s) as K
      array.push ([k, v])
    }
    return array
  }

  *[Symbol.iterator] () {
    for (let [s, v] of this.val_map) {
      let k = this.key_map.get (s) as K
      yield [k, v] as [K, V]
    }
  }

  key_array (): Array <K> {
    return new Array (...this.key_map.values ())
  }

  value_array (): Array <V> {
    return new Array (...this.val_map.values ())
  }

  clone (): dic_t <K, V> {
    let dic = new dic_t <K, V> ()
    dic.val_map = new Map (this.val_map)
    dic.key_map = new Map (this.key_map)
    return dic
  }
}
