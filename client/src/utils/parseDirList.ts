import { Dir, DirItem } from '../types'

const getDepth = (name: string) => {
  let count = 0
  for (const char of name) {
    if (char !== ' ') break
    count++
  }
  // Each new depth is represented by two spaces.
  return count / 2
}

export const parseDirList = (dirList: string): Dir => {
  const items: DirItem[] = []
  let depth = 0
  let openDirs: Record<number, DirItem> = {}

  const lines = dirList.split('\n')
  for (const line of lines) {
    if (!line) continue

    const path = line.trim()
    const isDir = path.endsWith('/')
    const type = isDir ? 'directory' : 'file'
    const name = isDir ? path.slice(0, -1) : path

    const item: DirItem = { name, type }

    // Use `line` because in `path` the tabs have already been trimmed.
    depth = getDepth(line)

    if (isDir) {
      item.children = []
      openDirs[depth] = item
    }

    const parent = depth === 0 ? items : openDirs[depth - 1].children
    if (!parent) {
      throw new Error(`Invalid dir list, no parent folder found for '${path}'`)
    }

    parent.push(item)
  }

  return items
}
