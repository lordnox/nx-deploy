
const PARSER = {
  YML  : () => require('yamljs'),
  JSON : () => JSON,
}

const stringify = (parserString, data) => {
  if(!PARSER[parserString])
    throw new Error('Invalid Parser')
  return PARSER[parserString]().stringify(data, null, 2)
}

const parse = (parserString, data) => {
  if(!PARSER[parserString])
    throw new Error('Invalid Parser')
  return PARSER[parserString]().parse(data)
}

module.exports = {
  parse, stringify
}
