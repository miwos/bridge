import { Bridge } from '../src/index'
import { NodeSerialTransport } from '../src/NodeSerialTransport'

const bridge = new Bridge(new NodeSerialTransport(), { debug: true })
await bridge.open({ path: 'COM11' })

bridge.on('/log/:type', (message, params) => console.log(message.args))

// await bridge.writeFile('__test__/nested/test.txt', 'test')
// await bridge.removeDir('__test__')
console.log(JSON.stringify(await bridge.getDir('__test__/many', true), null, 2))
