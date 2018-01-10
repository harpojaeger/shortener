
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('links').del()
    .then(function () {
      // Reset the id sequence
      return knex.raw('alter sequence links_id_seq restart with 1')
      .then( () => {
        // Inserts seed entries
        return knex('links')
        .insert([
          {url: 'http://harpojaeger.com', short: 'themostinterestingblogintheworld'},
          {url: 'http://google.com', short: 'dontbeevil'},
          {url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', short: 'important'},
        ]);
      })
    });
};
