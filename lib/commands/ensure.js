
const { exec } = require(`child_process`)

const {
  cmdLog,
  each,
} = require(`../utils`)

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

module.exports = ensureFn
