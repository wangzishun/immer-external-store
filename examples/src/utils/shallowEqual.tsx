/**
 *
 * @see https://github.com/facebook/react/blob/64acd3918a26d92773d3dd451a735603ef50d3a7/packages/shared/shallowEqual.js#L18
 * @see https://github.com/dashed/shallowequal/blob/master/index.js
 */

const hasOwnProperty = Object.prototype.hasOwnProperty

export const shallowEqual = (state, nextState) => {
  if (Object.is(state, nextState)) {
    return true
  }

  if (typeof state !== 'object' || !state || typeof nextState !== 'object' || !nextState) {
    return false
  }

  const keysA = Object.keys(state)
  const keysB = Object.keys(nextState)

  if (keysA.length !== keysB.length) {
    return false
  }

  const bHasOwnProperty = hasOwnProperty.bind(nextState)

  for (let idx = 0; idx < keysA.length; idx++) {
    const key = keysA[idx]

    if (!bHasOwnProperty(key) || !Object.is(state[key], nextState[key])) {
      return false
    }
  }

  return true
}
