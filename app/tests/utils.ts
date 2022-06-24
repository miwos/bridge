import { Dir } from '../src/types'

export const dirIncludes = (dir: Dir, name: string) =>
  dir.find((v) => v.name === name)

export const randomString = (length: number) => {
  length = length || 5
  const charSet =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  let result = ''
  while (length--) {
    result += charSet.charAt(Math.floor(Math.random() * charSet.length))
  }

  return result
}
