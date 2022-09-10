import type { Transport, TransportDataHandler } from './Transport'
import { SlipEncoder, SlipDecoder } from './utils/web-serial-slip'

export class WebSerialTransport implements Transport {
  private port: SerialPort | undefined
  private reader: ReadableStreamDefaultReader | undefined
  private writer: WritableStreamDefaultWriter | undefined
  private readableStreamClosed: Promise<void> | undefined
  private writableStreamClosed: Promise<void> | undefined
  private dataHandler: TransportDataHandler | undefined
  private openHandler: (() => any) | undefined
  private closeHandler: (() => any) | undefined

  async open(options: SerialOptions = { baudRate: 9600 }) {
    this.port = await navigator.serial.requestPort()
    this.port.addEventListener('connect', () => this.openHandler?.())
    this.port.addEventListener('disconnect', () => this.closeHandler?.())
    await this.port.open(options)

    this.setupReader()
    this.setupWriter()
    this.listen()
  }

  private setupWriter() {
    if (!this.port?.writable)
      throw new Error('Port is either not initialized or not writable.')

    const slipEncoder = new SlipEncoder()
    this.writableStreamClosed = slipEncoder.readable.pipeTo(this.port.writable)

    this.writer = slipEncoder.writable.getWriter()
  }

  private setupReader() {
    if (!this.port?.readable)
      throw new Error('Port is either not initialized or not readable.')

    const slipDecoder = new SlipDecoder()
    this.readableStreamClosed = this.port.readable.pipeTo(slipDecoder.writable)
    this.reader = slipDecoder.readable.getReader()
  }

  async listen() {
    if (!this.reader) throw new Error(`Reader is not setup.`)

    while (true) {
      const { value, done } = await this.reader.read()
      if (done) {
        this.reader.releaseLock()
        break
      }

      this.dataHandler?.(value)
    }
  }

  async write(data: Uint8Array) {
    await this.writer?.write(data)
  }

  onData(handler: TransportDataHandler) {
    this.dataHandler = handler
  }

  onClose(handler: () => any) {
    this.closeHandler = handler
  }

  onOpen(handler: () => any) {
    this.openHandler = handler
  }

  async close() {
    this.reader?.cancel()
    // Ignore any errors.
    await this.readableStreamClosed?.catch(() => {})

    this.writer?.close()
    await this.writableStreamClosed

    await this.port?.close()
  }
}
