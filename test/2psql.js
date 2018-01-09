const chai = require('chai')
const expect = chai.expect


describe('PSQL DB', () => {
  it('is reachable', (done) => {
    require('dotenv').config()
    const pg = require('pg')
    const knex = require('knex')({
      client: 'pg',
      connection: {
        host : process.env.PSQL_HOST,
        user : process.env.PSQL_USER,
        password : process.env.PSQL_PASS,
        database : process.env.PSQL_DB,
      }
    })
    knex.raw('select 1+1 as result').then(() => {
      done()
    })
  })
})
