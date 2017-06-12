#!/usr/bin/env node

const http = require('http')

const connect = (hostname, port, next) => {
  const options = {
    port,
    hostname,
    method: 'GET',
    path: '/',
  }

  const req = http.request(options, () => next(true) )
  req.on('error', () => next(false))
  req.end()
}

const [,,hostname, port = 80, timeout = 1000] = process.argv

if(!hostname) {
  console.log('')
  console.log('Usage:')
  console.log('  waitUntil <hostname> <port=80> <timeout=1000>')
  console.log('')
  console.log('Example')
  console.log('  waitUntil localhost 8000')
  console.log('  waitUntil localhost $PORT 3000')
  console.log('')
  process.exit(1)
}

let timedout = false
setTimeout( () => {
  console.log('timeout triggered')
  timedout = true
}, timeout)

console.log(`Waiting for ${hostname}:${port}`)
const test = () => {
  connect(hostname, port, connected => {
    if(connected) {
      console.log('Connected!')
      process.exit()
    }
    if(timedout) {
      console.log('Timeout!')
      process.exit(1)
    }
    setTimeout(test, 10)
  })
}

test()
