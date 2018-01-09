const chai = require('chai')
const expect = chai.expect

describe('PSQL envs', () => {
  it('are set', () => {
    require('dotenv').config()
    expect(process.env.PSQL_USER).to.be.a('string')
    expect(process.env.PSQL_PASS).to.be.a('string')
    expect(process.env.PSQL_DB).to.be.a('string')
    expect(process.env.PSQL_HOST).to.be.a('string')
  })
})
