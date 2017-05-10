#! /usr/bin/env node

const program = require(`commander`)

program.version(`0.0.1`)

program
  .command(`init`, `create an deployment configuration`)
  .command(`deploy`, `deploys the current application using the configuration`, { isDefault: true })

program.parse(process.argv)
