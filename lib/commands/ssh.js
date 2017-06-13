
const { exec } = require(`child_process`)

const {
  cmdLog,
  promiseResult,
} = require(`../utils`)

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

module.exports = sshFn
