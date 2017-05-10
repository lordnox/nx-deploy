#!/usr/bin/env node

const fs = require('fs')
const Path = require('path')

fs.readdir( __dirname, (err, files) => {
  if(err) {
    console.error(err)
    process.exit(1)
  }
  files.forEach( file => {
    const match = file.match(/\.js$/)
    if(match) {
      const index = match.index
      console.log(`${file} > ${file.substr(0, index)}`)
      fs.renameSync(
        Path.join(__dirname, file),
        Path.join(__dirname, file.substr(0, index))
      )
    }
  })
})
