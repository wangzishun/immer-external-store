const deepObject = {
  a: { b: { c: { d: { e: { f: { g: 'wangzi' } } } } } },
}

const dotPath = 'a.b.c.d.e.f.g'

const getValueFromDeepObjectBasedFuncWithCache = () => {
  console.time('getValueFromDeepObjectBasedFuncWithCache')

  const cachedPickers = new Map()

  for (let i = 0; i < 1_000_000; i++) {
    let picker = cachedPickers.get('test')

    if (!picker) {
      picker = new Function('o', `return o["${dotPath.split('.').join('"]["')}"];`)
      cachedPickers.set('test', picker)
    }

    picker(deepObject)
  }

  console.timeEnd('getValueFromDeepObjectBasedFuncWithCache')
}

const getValueFromDeepObjectBasedFunc = () => {
  console.time('getValueFromDeepObjectBasedFunc')

  for (let i = 0; i < 1_000_000; i++) {
    const picker = new Function('o', `return o["${dotPath.split('.').join('"]["')}"];`)

    picker(deepObject)
  }

  console.timeEnd('getValueFromDeepObjectBasedFunc')
}

const getValueFromDeepObjectBasedReduce = () => {
  console.time('getValueFromDeepObjectBasedReduce')

  for (let i = 0; i < 1_000_000; i++) {
    dotPath.split('.').reduce((o, p) => o[p], deepObject)
  }

  console.timeEnd('getValueFromDeepObjectBasedReduce')
}

const getValueFromDeepObjectBasedLoop = () => {
  console.time('getValueFromDeepObjectBasedLoop')

  for (let i = 0; i < 1_000_000; i++) {
    let result = deepObject

    const dots = dotPath.split('.')
    const len = dots.length
    for (let j = 0; j < len; j++) {
      result = result[dots[j]]
    }
  }

  console.timeEnd('getValueFromDeepObjectBasedLoop')
}

getValueFromDeepObjectBasedReduce()
getValueFromDeepObjectBasedLoop()
getValueFromDeepObjectBasedFuncWithCache()
getValueFromDeepObjectBasedFunc()
