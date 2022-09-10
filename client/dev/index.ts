import { Bridge } from '../src/index'
import { NodeSerialTransport } from '../src/NodeSerialTransport'

const bridge = new Bridge(new NodeSerialTransport(), { debug: true })
bridge.on('/open', () => console.log('open'))
await bridge.open({ path: 'COM11' })

// bridge.on('/log/:type', (message, params) => console.log(message.args))

