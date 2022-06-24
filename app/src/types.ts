export type MessageArg = string | number | boolean | Uint8Array

export interface Message {
  address: string
  args: MessageArg[]
}

export interface DirItem {
  name: string
  type: 'directory' | 'file'
  children?: DirItem[]
}

export type Dir = DirItem[]
