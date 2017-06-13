#!/usr/bin/env node

const program = require(`commander`)
const Deployment = require('../lib/deployment')

program
  .option(`-c, --config <path>`, `set config path. defaults to ./deploy.conf`, `.deploy.yml`)
  .option(`-p, --parser <yml,json>`, `Type of parser to use, defaults to file extension. Default: json`, /^(ya?ml|json)$/i)
  .parse(process.argv)

const {
  parser,
  config,
} = program

const deployment = new Deployment(config, parser)

deployment.initialize()
.then( () => {
  deployment.run('INITIALIZE')
  .then( () => {
    console.log(deployment.config.env)
  })
})
