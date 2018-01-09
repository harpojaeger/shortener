
exports.up = function(knex, Promise) {
  return knex.schema.createTable('links', table => {
    table.increments('id')
    table.string('url').notNullable()
    table.timestamp('created').defaultTo(knex.fn.now())
    table.string('short').unique()
  })
  .createTable('requests', table => {
    table.increments('id')
    table.string('slug').notNullable()
    table.timestamp('timestamp').defaultTo(knex.fn.now())
    table.string('result')
  })
  // we have to return a Promise after chaining, to make knex:migrate happy
  .then(() => {})

}

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('links').dropTable('requests').then(() => {})
};
