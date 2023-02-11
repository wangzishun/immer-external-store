import { useRef, useEffect } from 'react'

type Subscription<T> = (val: T, patchesPath: (string | number)[][]) => void

/**
 * references from ahooks.js
 */
export class EventEmitter<S> {
  constructor(public state: S) {
    console.log('EventEmitter', state)
  }

  private subscriptions = new Set<Subscription<S>>()

  emit = (nextState: S, patchesPath) => {
    this.state = nextState

    for (const subscription of this.subscriptions) {
      subscription(nextState, patchesPath)
    }
  }

  useSubscription = (callback: Subscription<S>) => {
    const ref = useRef<Subscription<S>>()
    ref.current = callback

    useEffect(() => {
      function subscription(val: S) {
        if (ref.current) {
          ref.current(val)
        }
      }

      this.subscriptions.add(subscription)
      return () => {
        this.subscriptions.delete(subscription)
      }
    }, [])
  }
}

export function useEventEmitter<S>(initialState: S) {
  const ref = useRef<EventEmitter<S>>()
  if (!ref.current) {
    ref.current = new EventEmitter(initialState)
  }

  return ref.current
}
