const Path = require(`path`)

const {
  each,
  getParser,
  log,
  mergeConfig,
  decodeConfiguration,
  translate,
  verifyCommand,
} = require('./utils')

const defaultConfigPath = Path.join(__dirname, 'default-deployment.yml')

const commands = {
  ssh : require('./commands/ssh'),
  scp : require('./commands/scp'),
  ensure : require('./commands/ensure'),
}

const defaultConfig = decodeConfiguration(defaultConfigPath)
.catch( () => {
  console.log(`Unable to load default configuration in "${defaultConfigPath}"`)
  process.exit()
})

class Deployment {
  constructor(configPath, parserString) {
    this.parser = getParser(configPath, parserString)
    this.configPath = configPath
    this.config = {}
    this.commands = commands
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
    return defaultConfig
    .then( config => this.config = config )
    .then( () => decodeConfiguration(this.configPath) )
    .catch( () => decodeConfiguration(Path.join(__dirname, this.configPath)) )
    .catch( () => { throw new Error(`could not find ${this.configPath} or ${Path.join('/', this.configPath)}`) } )
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

    const desc = this.config.stageDescriptions && this.config.stageDescriptions[stage]
    log(`Deployment`, `${stage} ${ desc && `\t> ${desc}` }`)

    return this.execute(stage)
    .catch( err => {
      console.error(err)
      process.exit(1)
    })
    .then( () => this.run(this.config.stages[stage]) )
  }
}

module.exports = Deployment
