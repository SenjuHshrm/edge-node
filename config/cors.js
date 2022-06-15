const whitelist = process.env.CORS_ORIGIN

module.exports = {
  origin: whitelist.split(' '),
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  exposedHeaders: ['Content-Type', 'Accept']
}