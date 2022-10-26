import crc from 'crc/calculators/crc16xmodem'
// @ts-ignore (missing types)
import Message from 'osc-js'
import { Transport } from './Transport'
import { MessageArg } from './types'
import {
  asArray,
  createRequestId,
  EventEmitter,
  parseDirList,
  PathParams,
} from './utils'

export interface BridgeOptions {
  responseTimeout?: number
  debug?: boolean
}

export class Bridge extends EventEmitter {
  private readSerialMode: 'osc' | 'raw' = 'osc'
  private responseTimeout
  private debug

  constructor(
    private transport: Transport,
    { responseTimeout = 1000, debug = false }: BridgeOptions = {}
  ) {
    super()

    this.responseTimeout = responseTimeout
    this.debug = debug

    this.transport.onData((data: Uint8Array) => this.handleData(data))
    this.transport.onOpen(() => this.emit('/open'))
    this.transport.onClose(() => this.emit('/close'))

    this.on('/raw/**', () => (this.readSerialMode = 'raw'))

    if (this.debug) {
      this.on('/data/dev', (data) =>
        console.log('[debug] ' + new TextDecoder().decode(data))
      )
    }

    // Emit a normal log event for any raw log, so we have a unified API for
    // handling logs.
    this.on('/raw/log/:type', async (_, { type }) => {
      const data = await this.waitForRawData()
      const text = new TextDecoder().decode(data as Uint8Array)
      this.emit(`/log/${type}`, { args: [text] })
    })
  }

  open(options: any) {
    return this.transport.open(options)
  }

  close() {
    return this.transport.close()
  }

  notify(name: string, args: MessageArg | MessageArg[]) {
    this.sendMessage(name, args)
  }

  request(name: string, args: MessageArg | MessageArg[]) {
    const id = createRequestId()
    this.sendMessage(name, [id, ...asArray(args)])
    return this.waitForResponse(id)
  }

  async readFile(fileName: string) {
    const buffer = (await this.request('/file/read', fileName)) as Uint8Array
    const content = new TextDecoder().decode(buffer).slice('File:'.length)
    return content
  }

  async writeFile(fileName: string, content: string) {
    if (!content.length) throw new Error("file can't be empty")

    const id = createRequestId()
    const buffer = new TextEncoder().encode(content)
    const checkSum = crc(buffer)

    const parts = fileName.split('/')
    const baseName = parts.pop() ?? fileName
    const dirName = parts.join('/')

    await this.sendMessage('/raw/file/write', [id, dirName, baseName, checkSum])
    await this.transport.write(buffer)
    return this.waitForResponse(id)
  }

  removeFile(fileName: string) {
    return this.request('/file/remove', fileName)
  }

  removeDir(dirName: string) {
    return this.request('/dir/remove', dirName)
  }

  async getDir(dirName: string, recursive = false) {
    const buffer = await this.request('/dir/list', [dirName, recursive ? 1 : 0])
    const content = new TextDecoder().decode(buffer as any)

    // To prevent a timeout while waiting for an empty dir list, the device
    // always has to send something (a leading 'Dir:'). If we only received this
    // and nothing else the directory is empty.
    if (content === 'Dir:') return []

    return parseDirList(content.slice('Dir:'.length))
  }

  private sendMessage(name: string, args: MessageArg | MessageArg[]) {
    const message = new Message(name, ...asArray(args))
    const data = message.pack()
    return this.transport.write(data)
  }

  private waitForResponse(id: number): Promise<MessageArg> {
    return new Promise((resolve, reject) => {
      const timeout = this.startResponseTimeout(reject)

      // Listen to all responses until we find a response with the matching
      // request id.
      const handler = async (message: Message, params: PathParams) => {
        const [requestId, payload] = message.args

        if (requestId === id) {
          this.off('/r/:type', handler)
          this.off('/raw/r/:type', handler)
          clearTimeout(timeout)

          // If the response is raw, we only received the response's header
          // message and the actual raw serial data will follow.
          const isRaw = message.address.startsWith('/raw/')
          const response = isRaw ? await this.waitForRawData() : payload

          if (params.type === 'success') {
            resolve(response)
          } else {
            const message = isRaw
              ? new TextDecoder().decode(response)
              : response
            reject(new Error(message))
          }
        }
      }

      this.on('/r/:type', handler)
      this.on('/raw/r/:type', handler)
    })
  }

  private waitForRawData() {
    return new Promise((resolve, reject) => {
      const timeout = this.startResponseTimeout(reject)
      this.once('/data/raw', (payload: Uint8Array) => {
        clearTimeout(timeout)
        resolve(payload)
      })
    })
  }

  private startResponseTimeout(reject: (e: Error) => void) {
    return setTimeout(
      () => reject(new Error('Response timeout')),
      this.responseTimeout
    )
  }

  private handleData(data: Uint8Array) {
    // Might be useful during development.
    this.emit('/data/dev', data)

    if (this.readSerialMode === 'osc') {
      const message = new Message()
      try {
        message.unpack(new DataView(data.buffer))
      } catch {
        // The data wasn't a valid OSC message.
        this.emit('/data/unknown', data)
        return
      }
      this.emit(message.address, message)
    } else if (this.readSerialMode === 'raw') {
      this.emit('/data/raw', data)
      // All raw data comes as one chunk, so we don't expect any more raw data
      // an can switch back to osc mode.
      this.readSerialMode = 'osc'
    }
  }
}
