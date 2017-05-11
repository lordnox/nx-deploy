#!/usr/bin/env node

const configFile = process.argv[2]
const nginxSource = process.argv[3]
const nginxDest = process.argv[4]

const exit = error => {
  console.error(error)
  console.error(process.argv)
  console.error('set-ports <configFile> <nginxSource> <nginxDest>')
  process.exit(1)
}

if(!configFile || !nginxSource || !nginxDest)
  exit('Something is missing for execution')

const fs = require('fs')

const readFile = path => new Promise( (resolve, reject) => {
  fs.readFile(path, 'utf8', (err, content) => {
    if(err)
      reject(err)
    else
      resolve(content)
  })
})

let config = null
let nginx = null

Promise.all([
  readFile(configFile)
  .then( content => {
    try {
      config = JSON.parse(content)
    } catch(err) {
      exit(err)
    }
  }),
  readFile(nginxSource)
  .then( content => nginx = content )
])
.catch( err => exit(err) )
.then( () => {
  nginx = Object.keys(config)
  .reduce( (conf, app) => {
    const { sourcePort, destPort } = config[app]
    console.log(`setting port for ${app} ${sourcePort} > ${destPort}`)
    return conf.replace(new RegExp(sourcePort, 'g'), destPort)
  }, nginx)
  fs.writeFile(nginxDest, nginx, err => {
    if(err)
      exit(err)
    else
      process.exit()
  })
})

