import { T as Transport, a as TransportDataHandler } from './Transport-301fee00.js';

declare class NodeSerialTransport implements Transport {
    private port;
    private writer;
    private dataHandler;
    private openHandler;
    private closeHandler;
    open(options: any): Promise<void>;
    private setupReader;
    private setupWriter;
    write(data: Uint8Array): Promise<void>;
    onData(handler: TransportDataHandler): void;
    onOpen(handler: () => any): void;
    onClose(handler: () => any): void;
    close(): Promise<void>;
}

export { NodeSerialTransport };
