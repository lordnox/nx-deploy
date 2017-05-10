#!/usr/bin/env node

const fs = require('fs')

const filename = process.argv[2]

if(!filename) {
  console.error('No File')
  process.exit(1)
}

fs.stat(filename, err => {
  console.log(err ? "NOK" : "OK")
})
