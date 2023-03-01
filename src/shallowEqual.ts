/**
 *
 * @see https://github.com/facebook/react/blob/64acd3918a26d92773d3dd451a735603ef50d3a7/packages/shared/shallowEqual.js#L18
 * @see https://github.com/dashed/shallowequal/blob/master/index.js
 */

const hasOwnProperty = Object.prototype.hasOwnProperty

export function shallowEqual(a, b) {
  if (Object.is(a, b)) {
    return true
  }

  if (typeof a !== 'object' || !a || typeof b !== 'object' || !b) {
    return false
  }

  const keysA = Object.keys(a)
  const keysB = Object.keys(b)

  if (keysA.length !== keysB.length) {
    return false
  }

  const bHasOwnProperty = hasOwnProperty.bind(b)

  for (let idx = 0; idx < keysA.length; idx++) {
    const key = keysA[idx]

    if (!bHasOwnProperty(key) || !Object.is(a[key], b[key])) {
      return false
    }
  }

  return true
}

export function arrayShallowEqual(a, b) {
  if (a.length !== b.length) {
    return false
  }

  for (let idx = 0; idx < a.length; idx++) {
    if (!shallowEqual(a[idx], b[idx])) {
      return false
    }
  }

  return true
}
