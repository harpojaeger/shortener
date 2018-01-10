const chai = require('chai')
const expect = chai.expect
const request = require('supertest')
const app = require('../index')
const knex = require('knex')(require('../knexfile').development)

describe('The HTTP server', () => {

  // Seed the DB before each test so we have some known data to work with
  beforeEach(() => {
    knex.migrate.latest()
    .then( () => {
      knex.seed.run()
    })
  })

  it('rejects a malformed request', done => {
    request(app)
    .post('/create')
    .send({
      url: 'http://test.com',
      custom: 'got2visit'
    })
    .expect(400, done)
  })
  it('accepts a well-formed request', done => {
    request(app)
    .post('/create')
    .send({
      url: 'http://test.com',
      custom: 'gottovisit'
    })
    .expect(200, done)
  })
  it('redirects to a thought-provoking video', done => {
    request(app)
    .get('/important')
    .expect(302, done)
  })
})
