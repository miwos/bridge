"use strict";

// src/NodeSerialTransport.ts
import { SerialPort } from "serialport";
import { SlipDecoder, SlipEncoder } from "@serialport/parser-slip-encoder";
var NodeSerialTransport = class {
  port;
  writer;
  dataHandler;
  openHandler;
  closeHandler;
  async open(options) {
    this.port = new SerialPort({
      baudRate: 9600,
      autoOpen: false,
      ...options
    });
    this.port.on("close", () => this.closeHandler?.());
    this.setupReader();
    this.setupWriter();
    return new Promise((resolve, reject) => {
      if (!this.port)
        throw new Error("Port is not initialized.");
      this.port.open((error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }
  setupReader() {
    if (!this.port)
      throw new Error("Port is not initialized.");
    const reader = this.port.pipe(new SlipDecoder());
    reader.on("data", (data) => {
      this.dataHandler?.(new Uint8Array(data));
    });
  }
  setupWriter() {
    this.writer = new SlipEncoder({
      START: 192
    });
    this.port && this.writer.pipe(this.port);
  }
  write(data) {
    return new Promise((resolve, reject) => {
      this.writer?.write(Buffer.from(data), (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }
  onData(handler) {
    this.dataHandler = handler;
  }
  onOpen(handler) {
    this.openHandler = handler;
  }
  onClose(handler) {
    this.closeHandler = handler;
  }
  async close() {
    return new Promise((resolve, reject) => {
      if (!this.port)
        throw new Error("Port is not initialized.");
      this.port.close((error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }
};
export {
  NodeSerialTransport
};
