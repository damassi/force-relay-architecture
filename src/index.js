import express from 'express'

const app = (module.exports = express())

app.use(require('./apps/isomorphic-relay-example/server'))
