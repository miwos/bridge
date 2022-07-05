"use strict";

// src/utils/web-serial-slip/control-characters.ts
var ESC = 219;
var END = 192;
var ESC_END = 220;
var ESC_ESC = 221;

// src/utils/web-serial-slip/SlipEncoder.ts
var SlipEncoderTransform = class {
  transform(chunk, controller) {
    const encoded = new Uint8Array(chunk.length * 2 + 2);
    let bytesCount = 0;
    encoded[bytesCount++] = END;
    const bytes = chunk.values();
    for (let byte of bytes) {
      if (byte === END) {
        encoded[bytesCount++] = ESC;
        byte = ESC_END;
      } else if (byte === ESC) {
        encoded[bytesCount++] = ESC;
        byte = ESC_ESC;
      }
      encoded[bytesCount++] = byte;
    }
    encoded[bytesCount++] = END;
    controller.enqueue(encoded.subarray(0, bytesCount));
  }
};
var SlipEncoder = class extends TransformStream {
  constructor() {
    super(new SlipEncoderTransform());
  }
};

// src/utils/web-serial-slip/SlipDecoder.ts
var SlipDecoderTransform = class {
  buffer = new Uint8Array(1024);
  bytesCount = 0;
  slipStart = false;
  slipEscape = false;
  transform(chunk, controller) {
    const bytes = chunk.values();
    for (let byte of bytes) {
      if (!this.slipStart && byte === END) {
        this.slipStart = true;
        continue;
      }
      if (this.slipEscape) {
        if (byte === ESC_ESC) {
          byte = ESC;
        } else if (byte === ESC_END) {
          byte = END;
        } else {
          this.slipEscape = false;
          this.enqueueBuffer(controller);
        }
      } else {
        if (byte === ESC) {
          this.slipEscape = true;
          continue;
        }
        if (byte === END) {
          this.slipEscape = false;
          this.slipStart = false;
          this.enqueueBuffer(controller);
          continue;
        }
      }
      this.slipEscape = false;
      if (this.slipStart)
        this.addByte(byte);
    }
  }
  addByte(byte) {
    if (this.bytesCount >= this.buffer.length) {
      const oldBuffer = this.buffer;
      this.buffer = new Uint8Array(this.buffer.length * 2);
      this.buffer.set(oldBuffer);
    }
    this.buffer[this.bytesCount++] = byte;
  }
  enqueueBuffer(controller) {
    controller.enqueue(this.buffer.subarray(0, this.bytesCount));
    this.buffer = new Uint8Array(1024);
    this.bytesCount = 0;
  }
  flush(controller) {
    controller.enqueue(this.buffer.subarray(0, this.bytesCount));
    this.bytesCount = 0;
  }
};
var SlipDecoder = class extends TransformStream {
  constructor() {
    super(new SlipDecoderTransform());
  }
};

// src/WebSerialTransport.ts
var WebSerialTransport = class {
  port;
  reader;
  writer;
  readableStreamClosed;
  writableStreamClosed;
  dataHandler;
  openHandler;
  closeHandler;
  async open(options = { baudRate: 9600 }) {
    this.port = await navigator.serial.requestPort();
    this.port.addEventListener("connect", () => this.openHandler?.());
    this.port.addEventListener("disconnect", () => this.closeHandler?.());
    await this.port.open(options);
    this.setupReader();
    this.setupWriter();
    this.listen();
  }
  setupWriter() {
    if (!this.port?.writable)
      throw new Error("Port is either not initialized or not writable.");
    const slipEncoder = new SlipEncoder();
    this.writableStreamClosed = slipEncoder.readable.pipeTo(this.port.writable);
    this.writer = slipEncoder.writable.getWriter();
  }
  setupReader() {
    if (!this.port?.readable)
      throw new Error("Port is either not initialized or not readable.");
    const slipDecoder = new SlipDecoder();
    this.readableStreamClosed = this.port.readable.pipeTo(slipDecoder.writable);
    this.reader = slipDecoder.readable.getReader();
  }
  async listen() {
    if (!this.reader)
      throw new Error(`Reader is not setup.`);
    while (true) {
      const { value, done } = await this.reader.read();
      if (done) {
        this.reader.releaseLock();
        break;
      }
      this.dataHandler?.(value);
    }
  }
  async write(data) {
    await this.writer?.write(data);
  }
  onData(handler) {
    this.dataHandler = handler;
  }
  onClose(handler) {
    this.closeHandler = handler;
  }
  onOpen(handler) {
    this.openHandler = handler;
  }
  async close() {
    this.reader?.cancel();
    await this.readableStreamClosed?.catch(() => {
    });
    this.writer?.close();
    await this.writableStreamClosed;
    await this.port?.close();
  }
};
export {
  WebSerialTransport
};
