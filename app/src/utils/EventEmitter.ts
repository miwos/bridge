import { parsePathPattern, PathParams } from './parsePathPattern'

export type EventEmitterParams = PathParams

export type EventEmitterHandler = (
  payload: any,
  params: EventEmitterParams
) => any

export interface EventEmitterEvent {
  path: string
  match: (path: string) => PathParams | null
  handlers: Array<EventEmitterHandler>
}

/**
 * An event emitter that uses OSC style path's as event names.
 */
export class EventEmitter {
  events: { [path: string]: EventEmitterEvent } = {}

  on(path: string, handler: EventEmitterHandler) {
    const { events } = this
    events[path] = events[path] ?? {
      path,
      match: parsePathPattern(path),
      handlers: [],
    }
    events[path].handlers.push(handler)
  }

  off(path: string, handler: EventEmitterHandler) {
    const handlers = this.events[path]?.handlers
    const index = handlers?.indexOf(handler)
    if (index !== undefined && index >= 0) handlers.splice(index, 1)
  }

  once(path: string, handler: EventEmitterHandler) {
    const handlerOnce = (payload: any, params: PathParams) => {
      handler.call(this, payload, params)
      this.off(path, handlerOnce)
    }
    this.on(path, handlerOnce)
  }

  emit(path: string, payload?: any) {
    for (const { match, handlers } of Object.values(this.events)) {
      if (!handlers.length) continue
      const params = match(path)
      if (params) {
        handlers.forEach((handler) => handler.call(this, payload, params))
      }
    }
  }
}
