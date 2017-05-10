
const program = require(`commander`)
const debug = require('debug')('deploy:init')
const fs = require(`fs`)

const { stringify } = require(`../lib/utils`)

program
  .option(`-o, --output <file>`, `which output file to write to. Default: .deploy.yml`, `.deploy.yml`)
  .option(`-p, --parser <yml,json>`, `Type of parser to use, defaults to file extension. Default: json`, /^(ya?ml|json)$/i)
  .option(`-H, --host <host>`, `which host to deploy to.`)
  .option(`-n, --name <appName>`, `name of the application.`)
  .parse(process.argv)

const {
  host,
  appName,
  parser : parserString,
  output
} = program

const deployment = {
  env : {
    host,
    appName
  }
}

debug(`Writing ${output}`)
console.log(deployment)
const parser = (parserString && parserString.toUpperCase()) || (/ya?ml$/i.test(output) ? 'YML' : 'JSON')
const outputString = stringify(parser, deployment)

fs.writeFile(output, outputString, err => {
  if(err)
    debug(`Writing ${output} failed: ${err}`)
  else
    debug(`Writing ${output} succeded.`)
})

