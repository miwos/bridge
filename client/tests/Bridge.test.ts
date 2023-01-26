import { Bridge } from '../src'
import { NodeSerialTransport } from '../src/NodeSerialTransport'
import { dirIncludes, randomString } from './utils'

const testDir = '__test__'
const path = 'COM8'
const bridge = new Bridge(new NodeSerialTransport())

beforeAll(async () => {
  bridge.on('/log/:type', (message, { type }) => {
    const [text] = message.args
    ;(console as any)[type](text)
  })

  await bridge.open({ path })
  await bridge.removeDir(testDir)
})
afterAll(() => bridge.close())

describe('Bridge', () => {
  it('requests a response from the device', async () => {
    const response = await bridge.request('/echo/int', 123)
    expect(response).toBe(123)
  })

  it('handles request response timeouts', async () => {
    const nonExistingOscAddress = `/test/${randomString(50)}`
    await expect(bridge.request(nonExistingOscAddress, 0)).rejects.toThrow(
      'Response timeout'
    )
  })

  it('writes and reads a file', async () => {
    const content = performance.now().toString()
    const file = `${testDir}/test.txt`
    await bridge.writeFile(file, content)
    expect(await bridge.readFile(file)).toBe(content)
  })

  it('handles empty files', async () => {
    const file = `${testDir}/test.txt`
    await expect(bridge.writeFile(file, '')).rejects.toThrowError(
      "file can't be empty"
    )
  })

  it("it throws an error if a file doesn't exit", async () => {
    const nonExistingFile = `${testDir}/${Date.now()}.txt`
    await expect(bridge.readFile(nonExistingFile)).rejects.toThrowError(
      "file doesn't exist"
    )
  })

  it('it creates missing parent directories', async () => {
    const file = `${testDir}/deeply/nested/test.txt`
    await expect(bridge.writeFile(file, 'test')).resolves.not.toThrowError()
  })

  it('lists a directory', async () => {
    expect(await bridge.getDir(testDir)).toMatchSnapshot()
  })

  it('handles empty directories', async () => {
    const dir = `${testDir}/empty/`
    // Create a new empty directory by writing a file and then deleting it.
    await bridge.writeFile(`${dir}/test.txt`, 'test')
    await bridge.removeFile(`${dir}/test.txt`)
    expect(await bridge.getDir(dir)).toEqual([])
  })

  it('removes a file', async () => {
    const name = 'test.txt'
    const file = `${testDir}/${name}`
    await bridge.writeFile(file, 'test')
    await bridge.removeFile(file)

    const dir = await bridge.getDir(testDir)
    expect(dirIncludes(dir, name)).toBeFalsy()
  })

  it('removes a directory (recursively)', async () => {
    await bridge.removeDir(testDir)

    const root = await bridge.getDir('/')
    expect(dirIncludes(root, testDir)).toBeFalsy()
  })

  it('handles many consecutive file writes', async () => {
    const content = randomString(2000)
    for (let i = 0; i < 10; i++) {
      await bridge.writeFile(`${testDir}/many/file-${i}.txt`, content)
    }
    const dir = await bridge.getDir(`${testDir}/many`)
    expect(dir).toMatchSnapshot()
  })
})
