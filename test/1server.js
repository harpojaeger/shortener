const chai = require('chai')
const expect = chai.expect
const request = require('supertest')
const app = require('../index')
const knex = require('knex')(require('../knexfile').development)

describe('The HTTP server', () => {

  // Seed the DB before each test so we have some known data to work with
  beforeEach((done) => {
    knex.seed.run()
    .then( () => done() )
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
  it('returns the correct stats for a shortlink', done => {
    request(app)
    .get('/important/stats')
    .expect(200)
    .then( response => {
      expect(response.body).to.be.an('object')
      expect(response.body).to.have.property('id')
      expect(response.body.id).to.equal(3)
      expect(response.body).to.have.property('histogram')
      expect(response.body.histogram).to.be.an('array')
      expect(response.body.histogram[0]).to.have.property('day')
      expect(response.body.histogram[0]).to.have.property('count')
      expect(response.body.histogram[0].count).to.equal('30')
      done()
    })
    .catch( (err) => {
      done(err)
    })
  })
})
