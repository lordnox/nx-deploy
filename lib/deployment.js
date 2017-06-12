const Path = require(`path`)
const { exec } = require(`child_process`)
const debug = require(`debug`)
const { parse } = require(`../lib/utils`)
const fs = require(`fs`)

const { NEXT_STAGE, STAGE_DESC } = require('../lib/stages')

const defaultConfig = parse('YML', fs.readFileSync(Path.join(__dirname, 'default-deployment.yml'), 'utf8'))

const getParser = (configPath, parserString) => (parserString && parserString.toUpperCase()) || (/ya?ml$/i.test(configPath) ? 'YML' : 'JSON')

const log = (fn, ...args) => debug(`deploy:log:${fn}`)(...args)
const cmdLog = (fn, ...args) => debug(`deploy:cmd:${fn}`)(...args)

const verifyCommand = command => {
  if(typeof command === 'string') {
    return {
      cmd : 'ssh',
      ssh : command
    }
  }
  return command
}

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

/**
 * replaces all found variables in item
 */
const translate = (item, locals) => Object.keys(locals)
  .reduce( (item, key) => item.replace(new RegExp(`:${key}`, 'g'), locals[key]), item)

const verfiyConfig = config => new Promise( (resolve) => {
  log(`config`, 'Verfiy')
  log(`config`, JSON.stringify(config, null, 2))

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

const readConfiguration = path => new Promise( (resolve, reject) => {
  fs.readFile(path, 'utf8', (err, data) => err ? reject(err) : resolve(data) )
})

const promiseResult = (resolve, reject) => (err, stdout, stderr) =>
  err ? reject(stderr && err) : resolve(stdout)

const each = (list, cb) => new Promise( (resolve, reject) => {
  if(!list || !list.length)
    return resolve()
  let promise = cb(list.slice(0, 1)[0])
  list.slice(1).forEach( item => promise = promise.then( () => cb(item) ) )
  return promise
  .then( resolve )
  .catch( reject )
})

const sshFn = ({ ssh, transform, save, context }) => new Promise( (resolve, reject) => {
  const cmd = context.translate(`echo ${JSON.stringify(ssh)} | ssh -t :host`)
  .replace(`$`, `\\$`)
  exec(cmd, promiseResult(resolve, reject))
})
.then( result => context.transform(result, transform) )
.then( result => {
  if(save) context.save(save, result)
  return Promise.resolve(result)
})
sshFn.log = ({ name = `ssh`, ssh }) => cmdLog(name, `ssh ${ssh}`)

const scpFn = ({ src, dest, context, flags = '-rqC' }) => new Promise( (resolve, reject) => {
  return exec(context.translate(`scp ${flags} ${(src)} :host:${dest}`), promiseResult(resolve, reject))
})
scpFn.log = ({ name = `scp`, src, dest }) => cmdLog(name, `scp ${src} > ${dest}`)

const ensureFn = ({ name, ensure, context, commands = [] }) => ensureFn.verify(ensure, context)
  .then( verified => {
    if(verified) return true
    log(name, `needs to run ${commands.length} command${commands.length !== 1 && 's' || ''}`)
    return ensureFn.install(commands, context)
      .then( () => ensureFn.verify(ensure, context) )
  })
ensureFn.log = ({ name=`ensure` }) => cmdLog(name, `ensure`)
ensureFn.verify = (ensure, context) => each( ensure, verify => {
  return context.cmd(verify)
  .catch( () => "" )
  .then( response => new Promise( (resolve, reject) => {
    if(verify.is) {
      resolve(context.translate(verify.is) === response)
    } else if(verify.isnt) {
      resolve(context.translate(verify.isnt) !== response)
    } else {
      reject(`No compare found for result: ${response}`)
    }
  }))
})
ensureFn.install = (commands, context) => each( commands, cmd => context.cmd(cmd) )

class Deployment {
  constructor(configPath, parserString) {
    this.parser = getParser(configPath, parserString)
    this.configPath = configPath
    this.config = defaultConfig
    this.commands = { ssh : sshFn, scp : scpFn, ensure : ensureFn }
    this.transforms = {
      trim : item => item.trim ? item.trim() : item,
    }
  }

  save(key, val) {
    this.config.env[key] = val
  }

  translate(item) {
    return translate(item, this.config.env)
  }

  transform(item, transformations = []) {
    return transformations.reduce( (item, transform) => this.transforms[transform](item), item)
  }

  initialize() {
    return readConfiguration(this.configPath)
    .catch( () => readConfiguration(Path.join(__dirname, this.configPath)) )
    .catch( () => { throw new Error(`could not find ${this.configPath} or ${Path.join('/', this.configPath)}`) } )
    .then( config => parse(this.parser, config) )
    .then( verfiyConfig )
    .then( config => this.config = mergeConfig(this.config, config) )
  }

  execute(stage) {
    if(this[stage])
      return this[stage]()
    if(this.config[stage])
      return each( this.config[stage], command => this.cmd(command) )
    return Promise.resolve()
  }

  cmd(_command) {
    const command = verifyCommand(_command, this)
    if(!command)
      return Promise.reject(`Invalid Command given`)
    const { cmd } = command
    if(!cmd) {
      console.error(command)
      return Promise.reject(`No Command given`)
    }
    if(!this.commands[cmd])
      return Promise.reject(`Could not find ${cmd}-command`)
    if(this.commands[command.cmd].log)
      this.commands[command.cmd].log(command)
    return this.commands[command.cmd](Object.assign({}, command, {
      context : this
    }))
  }

  run(stage) {
    if(!stage) {
      log(`Deployment`, `No stages left to run, deployment was successful`)
      return
    }

    log(`Deployment`, `${stage} ${ this.config.stageDescriptions && this.config.stageDescriptions[stage] && `\t> ${this.config.stageDescriptions[stage]}` }`)
    return this.execute(stage)
    .catch( err => {
      console.error(err)
      process.exit(1)
    })
    .then( () => this.run(this.config.stages[stage]) )
  }
}

module.exports = Deployment
