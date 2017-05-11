#!/usr/bin/env node

const configFile = process.argv[2]
const application = process.argv[3]
const _sourcePort = process.argv[4]
const _destPort = process.argv[5]

const exit = error => {
  console.error(error)
  console.error(process.argv)
  console.error('set-ports <configFile> <appName> <sourcePort> <destPort>')
  process.exit(1)
}

if(!configFile || !application || !_sourcePort || !_destPort)
  exit('Something is missing for execution')

const sourcePort = parseInt(_sourcePort, 10)
const destPort = parseInt(_destPort, 10)
const fs = require('fs')
const Path = require('path')

const path = Path.join(configFile)

fs.readFile(path, (err, file) => {
  let config = null
  if(err) {
    // if the file does not exist, ignore the error
    if(err.code !== 'ENOENT')
      exit(err)
  } else {
    // if the file exists, try to parse it
    try {
      config = JSON.parse(file)
      // no need to catch the error, just assume empty or corrupt file
    } catch(err) {}
  }
  // catch errors
  if(!config)
    config = {}
  config[application] = Object.assign({}, config[application] || {}, { sourcePort, destPort })
  fs.writeFile(path, JSON.stringify(config, null, 2), err => {
    if(err)
      exit(err)
    process.exit()
  })
})
