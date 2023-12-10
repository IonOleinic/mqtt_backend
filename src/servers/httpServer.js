const http = require('http')
const expressServer = require('./expressServer')

const server = http.createServer(expressServer)

module.exports = server
