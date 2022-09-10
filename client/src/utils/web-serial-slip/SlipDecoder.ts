import { END, ESC_END, ESC, ESC_ESC } from './control-characters'

/**
 * Based on node-serialport's encoder: {@link https://github.com/serialport/node-serialport/blob/master/packages/parser-slip-encoder/lib/decoder.js}
 */
class SlipDecoderTransform {
  buffer = new Uint8Array(1024)
  bytesCount = 0
  slipStart = false
  slipEscape = false

  transform(chunk: Uint8Array, controller: TransformStreamDefaultController) {
    const bytes = chunk.values()
    for (let byte of bytes) {
      if (!this.slipStart && byte === END) {
        this.slipStart = true
        continue
      }

      if (this.slipEscape) {
        if (byte === ESC_ESC) {
          byte = ESC
        } else if (byte === ESC_END) {
          byte = END
        } else {
          this.slipEscape = false
          this.enqueueBuffer(controller)
        }
      } else {
        if (byte === ESC) {
          this.slipEscape = true
          continue
        }

        if (byte === END) {
          this.slipEscape = false
          this.slipStart = false
          this.enqueueBuffer(controller)
          continue
        }
      }

      this.slipEscape = false

      if (this.slipStart) this.addByte(byte)
    }
  }

  private addByte(byte: number) {
    if (this.bytesCount >= this.buffer.length) {
      // 'Resize' the buffer by creating a bigger one and copy the old into
      // the new. To prevent too much copying we grow the buffer exponentially.
      const oldBuffer = this.buffer
      this.buffer = new Uint8Array(this.buffer.length * 2)
      this.buffer.set(oldBuffer)
    }
    this.buffer[this.bytesCount++] = byte
  }

  private enqueueBuffer(controller: TransformStreamDefaultController) {
    controller.enqueue(this.buffer.subarray(0, this.bytesCount))
    this.buffer = new Uint8Array(1024)
    this.bytesCount = 0
  }

  flush(controller: TransformStreamDefaultController) {
    controller.enqueue(this.buffer.subarray(0, this.bytesCount))
    this.bytesCount = 0
  }
}

export class SlipDecoder extends TransformStream {
  constructor() {
    super(new SlipDecoderTransform())
  }
}
