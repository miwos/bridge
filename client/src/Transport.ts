export interface Transport {
  write(data: Uint8Array): Promise<void>
  open(options?: any): Promise<void>
  close(): Promise<void>
  onData(handler: TransportDataHandler): any
  onOpen(handler: () => any): any
  onClose(handler: () => any): any
}

export type TransportDataHandler = (data: Uint8Array) => any