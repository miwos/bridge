import { Bridge } from '../src/index'

const isBrowser = typeof window !== 'undefined'
let bridge: Bridge | undefined

const main = async () => {
  const Transport = isBrowser
    ? (await import('../src/WebSerialTransport')).WebSerialTransport
    : (await import('../src/NodeSerialTransport')).NodeSerialTransport

  bridge = new Bridge(new Transport(), { debug: true })
  await bridge.open({ path: 'COM8', baudRate: 9600 })

  bridge.on('/log/:type', (message, params) => console.log(message.args))

  console.log(await bridge.request('/echo/int', [1]))
  console.log(await bridge.request('/echo/int', [2]))
  console.log(await bridge.request('/echo/int', [3]))
}

if (isBrowser) {
  // Browser needs a user-event before opening the serial port. Also it is handy
  // to quickly toggle the connection while developing.
  let isConnected = false
  window.addEventListener('click', () => {
    if (isConnected) bridge?.close()
    else main()
    isConnected = !isConnected
    document.getElementById('status')!.innerText = isConnected
      ? 'Connected'
      : 'Not Connected'
  })
} else {
  main()
}
