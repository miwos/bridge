import { T as Transport, a as TransportDataHandler } from './Transport-301fee00.js';

declare class WebSerialTransport implements Transport {
    private port;
    private reader;
    private writer;
    private readableStreamClosed;
    private writableStreamClosed;
    private dataHandler;
    private openHandler;
    private closeHandler;
    open(options?: SerialOptions): Promise<void>;
    private setupWriter;
    private setupReader;
    listen(): Promise<void>;
    write(data: Uint8Array): Promise<void>;
    onData(handler: TransportDataHandler): void;
    onClose(handler: () => any): void;
    onOpen(handler: () => any): void;
    close(): Promise<void>;
}

export { WebSerialTransport };
