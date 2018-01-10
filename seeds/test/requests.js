
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('requests').del()
    .then( () => {
      // reset the id sequence
      return knex.raw('alter sequence requests_id_seq restart with 1')
      .then( () => {
        // Seed db with 30 successful requests for shortlink 5
        return knex('requests').insert(Array(30).fill({
          slug: 'important',
          result: 302,
          matched_id: 3,
          method: 'slug_string'
        }))
      })
    })
}
