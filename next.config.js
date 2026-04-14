const nextPWA = require("next-pwa")

const isDev = process.env.NODE_ENV !== "production"

const withPWA = nextPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: isDev,
})

module.exports = withPWA({})