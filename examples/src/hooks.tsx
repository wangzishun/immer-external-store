import { createEventContext } from "./utils";

export const EvtCtx = createEventContext({
  deep: { count: 0, hallo: 'world' },
  shadow: { count: 0, name: { wangzi: 0 } },
})
