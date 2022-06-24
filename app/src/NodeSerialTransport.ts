import type { Transport, TransportDataHandler } from './Transport'
import { SerialPort } from 'serialport'
import { SlipDecoder, SlipEncoder } from '@serialport/parser-slip-encoder'

export class NodeSerialTransport implements Transport {
  private port: SerialPort | undefined
  private writer: SlipEncoder | undefined
  private dataHandler: TransportDataHandler | undefined
  private openHandler: (() => any) | undefined
  private closeHandler: (() => any) | undefined

  async open(options: any) {
    this.port = new SerialPort({
      baudRate: 9600,
      autoOpen: false,
      ...options,
    })

    this.port.on('close', () => this.closeHandler?.())

    this.setupReader()
    this.setupWriter()

    return new Promise<void>((resolve, reject) => {
      if (!this.port) throw new Error('Port is not initialized.')

      this.port.open((error) => {
        if (error) {
          reject(error)
        } else {
          resolve()
        }
      })
    })
  }

  private setupReader() {
    if (!this.port) throw new Error('Port is not initialized.')

    const reader = this.port.pipe(new SlipDecoder())
    reader.on('data', (data: Buffer) => {
      this.dataHandler?.(new Uint8Array(data))
    })
  }

  private setupWriter() {
    this.writer = new SlipEncoder({
      // Send the END character also at the start (this is a special version
      // of SLIP that is implemented on the device).
      START: 0xc0,
    })
    this.port && this.writer.pipe(this.port)
  }

  write(data: Uint8Array) {
    return new Promise<void>((resolve, reject) => {
      this.writer?.write(Buffer.from(data), (error) => {
        if (error) {
          reject(error)
        } else {
          resolve()
        }
      })
    })
  }

  onData(handler: TransportDataHandler) {
    this.dataHandler = handler
  }

  onOpen(handler: () => any) {
    this.openHandler = handler
  }

  onClose(handler: () => any) {
    this.closeHandler = handler
  }

  async close() {
    return new Promise<void>((resolve, reject) => {
      if (!this.port) throw new Error('Port is not initialized.')

      this.port.close((error) => {
        if (error) {
          reject(error)
        } else {
          resolve()
        }
      })
    })
  }
}
