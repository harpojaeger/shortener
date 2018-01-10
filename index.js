const express = require('express')
const app = express()
const bodyParser = require('body-parser')
require('dotenv').config()
// Default to port 5000, but let user set their own if they want.
const port = process.env.PORT || 5000
const knex = require('knex')(require('./knexfile').development)
const Joi = require('joi')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.post('/create', (req, res) => {
  // Validate the submitted JSON against the schema
  const schema = Joi.object().keys({
    url: Joi.string().uri().required(),
    // Only alpha characters
    custom: Joi.string().regex(/^[a-z]+$/i).not('create')
  })
  if(Joi.validate(req.body, schema).error === null) {
    // Handle requests that include a desired custom shortlink
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
    // Handle requests without a custom shortlink
    } else {
      // check if this URL has already been shortened
      knex('links')
      .select('*')
      .where( { url: req.body.url })
      .then( resp => {
        if(resp.length == 0) {
          // create a new shortlink
          knex('links')
          // Return the info on the new shortlink that's created
          .returning('*')
          .insert({
            url: req.body.url,
          })
          .then( (resp) => {
            // Send the new shortlink back to the user
            res.status(200).send(resp[0])
          })
        } else {
          // return the existing shortlink
          res.status(200).send(resp[0])
        }
      })
    }
  } else {
    // Handle malformed requests
    res.status(400).send({
      response: 400,
      message: "Your request must be an object with the properties url and custom. url is required and must be a url. Custom is optional and may be any alpha string except 'create'."
    })
  }
})

app.get('/:slug/stats', (req, res) => {
  // First, we need to figure out which shortlink's stats are being requested. Same trick as below.
  var idToSearch = parseInt(req.params.slug, 10)
  if(!Number.isInteger(idToSearch)) idToSearch = 0
  knex('links')
  .select('*')
  .where({ short: req.params.slug })
  .orWhere({ id: idToSearch })
  .then( resp => {
    if(resp.length==0) {
      // This shortlink doesn't exist, so neither does its stats page.
      res.sendStatus(404)
    } else {
      // This is the canonical, numerical shortlink ID, which we can now use to search the 'requests' table.
      const linkId = resp[0].id

      // Using knex.raw to allow advanced PostgreSQL date_trunc function
      knex('requests')
      .select(knex.raw("date_trunc('day', timestamp) as day, count(*)"))
      .where({ matched_id: linkId })
      .groupBy(1)
      .then(histoData => {
        // Object representing the stats on this shortlink.
        const finalResponse = Object.assign({}, resp[0], {histogram: histoData})
        res.send(finalResponse)
      })
    }
  })

})

app.get('/:slug', (req, res) => {
  // Parse the requested shortlink to an integer. If it isn't one, search for the shortlink with id 0, which doesn't exist.
  var idToSearch = parseInt(req.params.slug, 10)
  if (!Number.isInteger(idToSearch)) idToSearch = 0

  knex('links')
  .select('*')
  // Two possible ways of matching: custom shortlinks and IDs. The first will return a result if the slug is alphanumberic, the second if it's an ID.
  .where({ short: req.params.slug })
  .orWhere({ id: idToSearch })
  .then( (resp) => {
    if(resp.length==0) {
      // No shortlink was found; log the request.
      knex('requests')
      .returning('*')
      .insert({
        // Record the slug that was searched.
        slug: req.params.slug,
        // Record that a 404 was returned.
        result: 404,
        // No shortlink could be matched.
        matched_id: null,
        // A match was not successful via either method (alphanumeric slug or ID).
        method: null,
      })
      res.sendStatus(404)
    } else {
      knex('requests')
      .returning('*')
      .insert({
        // Record the slug that was searched.
        slug: req.params.slug,
        // A 302 redirect was performed.
        result: 302,
        // Record the id of the shortlink that was matched.
        matched_id: resp[0].id,
        // Which method was used to match this link? Useful for debugging.
        method: idToSearch == 0 ? 'slug_string' : 'numeric_id'
      })
      // Perform the redirect. I think 302 is the right one.
      res.redirect(302, resp[0].url)
    }
  })
})

app.listen(port, () => {
  console.log('Server is running on port', port)
})

module.exports = app
