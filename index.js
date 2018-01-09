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
    if(req.body.custom) {
      // Before proceeding, check if this custom shortlink is available
      knex('links')
      .count('short')
      .where( { short: req.body.custom })
      .then( (resp) => {
        if(resp[0].count == 0) {
          // create the shortlink
          knex('links')
          .returning('*')
          .insert({
            url: req.body.url,
            short: req.body.custom,
          })
          .then( (resp) => {
            res.status(200).send(resp[0])
          })
        } else {
          // Not sure if 409 Conflict is the right response here, but I'm gonna go with it.
          res.status(409).send({
            response: 409,
            message: 'The requested shortlink is already in use.'
          })
        }
      })
    } else {
      // check if this URL is already in the database
      knex('links')
      .count('url')
      .where( { url: req.body.url })
      .then( resp => {
        if(resp[0].count == 0) {
          // create a new shortlink
          knex('links')
          .returning('*')
          .insert({
            url: req.body.url,
          })
          .then( (resp) => {
            res.status(200).send(resp[0])
          })
        } else {
          // return the existing shortlink
          res.status(200).send(resp[0])
        }
      })
    }
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
