# URL shortener
A bitly-like URL shortener that runs locally.

## Installation
1. Download/clone repo
2. `yarn install`
3. Make sure you have PostgreSQL and `knex` installed globally (`npm i -g knex`)
3. Configure credentials in `knexfile.js.example` and rename to `knexfile.js`
4. `knex migrate:latest` to initialize database
5. `yarn test`
5. `yarn start`
