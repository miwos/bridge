import { T as Transport } from './Transport-301fee00.js';

declare type MessageArg = string | number | boolean | Uint8Array;
interface DirItem {
    name: string;
    type: 'directory' | 'file';
    children?: DirItem[];
}
declare type Dir = DirItem[];

declare type PathParams = Record<string, string>;

declare type EventEmitterParams = PathParams;
declare type EventEmitterHandler = (payload: any, params: EventEmitterParams) => any;
interface EventEmitterEvent {
    path: string;
    match: (path: string) => PathParams | null;
    handlers: Array<EventEmitterHandler>;
}
/**
 * An event emitter that uses OSC style path's as event names.
 */
declare class EventEmitter {
    events: {
        [path: string]: EventEmitterEvent;
    };
    on(path: string, handler: EventEmitterHandler): void;
    off(path: string, handler: EventEmitterHandler): void;
    once(path: string, handler: EventEmitterHandler): void;
    emit(path: string, payload?: any): void;
}

interface BridgeOptions {
    responseTimeout?: number;
    debug?: boolean;
}
declare class Bridge extends EventEmitter {
    private transport;
    private readSerialMode;
    private responseTimeout;
    private debug;
    constructor(transport: Transport, { responseTimeout, debug }?: BridgeOptions);
    open(options: any): Promise<void>;
    close(): Promise<void>;
    notify(name: string, args: MessageArg | MessageArg[]): void;
    request(name: string, args: MessageArg | MessageArg[]): Promise<MessageArg>;
    readFile(fileName: string): Promise<string>;
    writeFile(fileName: string, content: string): Promise<MessageArg>;
    removeFile(fileName: string): Promise<MessageArg>;
    removeDir(dirName: string): Promise<MessageArg>;
    getDir(dirName: string, recursive?: boolean): Promise<Dir>;
    private sendMessage;
    private waitForResponse;
    private waitForRawData;
    private startResponseTimeout;
    private handleData;
}

export { Bridge, BridgeOptions };
