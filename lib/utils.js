
const Path = require(`path`)
const debug = require(`debug`)
const fs = require(`fs`)

const PARSER = {
  YML  : () => require('yamljs'),
  JSON : () => JSON,
}

const cmdLog = (fn, ...args) => debug(`deploy:cmd:${fn}`)(...args)

const each = (list, cb) => new Promise( (resolve, reject) => {
  if(!list || !list.length)
    return resolve()
  let promise = cb(list.slice(0, 1)[0])
  list.slice(1).forEach( item => promise = promise.then( () => cb(item) ) )
  return promise
  .then( resolve )
  .catch( reject )
})

const getParserByPath = path => (/ya?ml$/i.test(path) ? 'YML' : 'JSON')
const getParserByString = parserString => parserString && parserString.toUpperCase()
const getParser = (configPath, parserString) => getParserByString(parserString) || getParserByPath(configPath)

const log = (fn, ...args) => debug(`deploy:log:${fn}`)(...args)

const mergeConfig = (_source, config) => {
  const source = Object.assign({}, _source)
  Object.keys(config).forEach( key => {
    if(Array.isArray(config[key])) {
      source[key] = [...config[key]]
    } else if(typeof config[key] === `object`) {
      source[key] = Object.assign({}, source[key], config[key])
    } else {
      source[key] = config[key]
    }
  })
  return source
}

const parse = (parserString, data) => {
  if(!PARSER[parserString])
    throw new Error('Invalid Parser')
  return PARSER[parserString]().parse(data)
}

const promiseResult = (resolve, reject) => (err, stdout, stderr) =>
  err ? reject(stderr && err) : resolve(stdout)

const readConfiguration = path => new Promise( (resolve, reject) => {
  fs.readFile(path, 'utf8', (err, data) => err ? reject(err) : resolve(data) )
})

const decodeConfiguration = path => {
  const parser = PARSER[getParserByPath(path)]()
  return readConfiguration(path)
  .then( parser.parse )
  .then( verfiyConfig )
}

const stringify = (parserString, data) => {
  if(!PARSER[parserString])
    throw new Error('Invalid Parser')
  return PARSER[parserString]().stringify(data, null, 2)
}

/**
 * replaces all found variables in item
 */
const translate = (item, locals) => Object.keys(locals)
  .reduce( (item, key) => item.replace(new RegExp(`:${key}`, 'g'), locals[key]), item)

const verfiyConfig = config => new Promise( (resolve) => {
  if(!config.env) config.env = {}

  config.env.scriptsPath = Path.join(__dirname, `..`, `scripts`, `*.*`)
  Object.keys(process.env)
  .forEach( key => Object.keys(config.env)
    .forEach( cnf => {
      if(config.env[cnf] === key)
        config.env[cnf] = process.env[key]
    })
  )
  resolve(config)
})

const verifyCommand = command => {
  if(typeof command === 'string') {
    return {
      cmd : 'ssh',
      ssh : command
    }
  }
  return command
}

module.exports = {
  cmdLog,
  each,
  getParser,
  log,
  mergeConfig,
  parse,
  promiseResult,
  decodeConfiguration,
  stringify,
  translate,
  verfiyConfig,
  verifyCommand,
}
