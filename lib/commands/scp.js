
const { exec } = require(`child_process`)

const {
  cmdLog,
  promiseResult,
} = require(`../utils`)

const scpFn = ({ src, dest, context, flags = '-rqC' }) => new Promise( (resolve, reject) => {
  return exec(context.translate(`scp ${flags} ${(src)} :host:${dest}`), promiseResult(resolve, reject))
})
scpFn.log = ({ name = `scp`, src, dest }) => cmdLog(name, `scp ${src} > ${dest}`)

module.exports = scpFn
