const allowedOrigins = [
  process.env.FRONT_URL,
  'http://192.168.12.108:8081',
  'http://192.168.12.108:3000',
  'http://192.168.1.187:8081',
  'http://192.168.1.187:3000',
  'http://127.0.0.1:3000',
]

module.exports = allowedOrigins
