#!/usr/bin/env node

const net = require('net')

let portrange = 3010

function getPort (cb) {
  const port = portrange
  portrange += 1

  const server = net.createServer()

  server.listen(port, () => {
    server.once('close', () => {
      cb(port)
    })
    server.close()
  })
  server.on('error', () => {
    getPort(cb)
  })
}

getPort(port => {
  console.log(port)
})
