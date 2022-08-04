const whitelist = process.env.CORS_ORIGIN;

module.exports = {
  origins: whitelist.split(" "),
  allowedHeaders: ["Content-Type", "Accept", "Authorization"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  exposedHeaders: ["Content-Type", "Accept"],
};
