#!/usr/bin/env node

const timestamp = process.argv[2]

const pm2 = require('pm2')

const exit = err => {
  if(err) {
    console.error(err)
    process.exit(2)
  } else pm2.disconnect()
}

const err = function(next) { return (err, ...args) => {
  if(err) return exit(err)
  return next.apply(this, args)
} }

const each = (list, cb) => new Promise( (resolve, reject) => {
  if(!list || !list.length)
    return resolve()
  let promise = cb(list.slice(0, 1)[0])
  list.slice(1).forEach( item => promise = promise.then( () => cb(item) ) )
  return promise
  .then( resolve )
  .catch( reject )
})

const deleteApp = ({ pm_id }) => new Promise( (resolve, reject) => {
  console.log('delete ' + pm_id)
  pm2.delete(pm_id, err => {
    if(err)
      reject(err)
    else
      resolve(pm_id)
  })
} )



pm2.connect( err ( () => {
  pm2.list( err ( list => {

    each( list.filter( ({ name }) => name !== timestamp ), deleteApp )
    .then( () => exit() )
    .catch( exit )
  }))
}))
