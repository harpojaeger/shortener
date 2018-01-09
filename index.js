const express = require('express')
const app = express()
const bodyParser = require('body-parser')
require('dotenv').config()
const port = process.env.PORT || 5000
const knex = require('knex')(require('./knexfile').development)
const Joi = require('joi')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.post('/create', (req, res) => {
  const schema = Joi.object().keys({
    // quick-and-dirty URL validation
    url: Joi.string().regex(/https?:\/\/(www\.)?[a-z0-9\.]/i).required(),
    custom: Joi.string().alphanum().not('create')
  })
  if(Joi.validate(req.body, schema).error === null) {
    // make the shortening request
  } else {
    res.status(400).send({
      response: 400,
      message: "Your request must be an object with the properties url and custom. url is required and must be a url. Custom is optional, but may not have the value 'create'."
    })
  }
})

app.get('/.*/stats', (req, res) => {
  // handle requests for stats on a link
})

app.get( (req, res) => {
  // handle actual URL redirects
})

app.listen(port, () => {
  console.log('Server is running on port', port)
})

module.exports = app
