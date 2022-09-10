import { END, ESC_END, ESC, ESC_ESC } from './control-characters'

/**
 * Based on node-serialport's decoder: {@link https://github.com/serialport/node-serialport/blob/master/packages/parser-slip-encoder/lib/encoder.js}
 */
class SlipEncoderTransform implements Transformer {
  transform(chunk: Uint8Array, controller: TransformStreamDefaultController) {
    // Allocate memory for the worst-case scenario: all bytes are escaped,
    // plus start and end separators.
    const encoded = new Uint8Array(chunk.length * 2 + 2)
    let bytesCount = 0

    encoded[bytesCount++] = END

    const bytes = chunk.values()
    for (let byte of bytes) {
      if (byte === END) {
        encoded[bytesCount++] = ESC
        byte = ESC_END
      } else if (byte === ESC) {
        encoded[bytesCount++] = ESC
        byte = ESC_ESC
      }

      encoded[bytesCount++] = byte
    }

    encoded[bytesCount++] = END
    controller.enqueue(encoded.subarray(0, bytesCount))
  }
}

export class SlipEncoder extends TransformStream {
  constructor() {
    super(new SlipEncoderTransform())
  }
}
