# URL shortener
A bitly-like URL shortener that runs locally.

## Installation
1. Download/clone repo
2. `yarn install`
3. Make sure you have PostgreSQL and `knex` installed globally (`npm i -g knex`)
4. `knex migrate:latest` to create database
5. `knex seed:run` to seed shortlink data
5. `yarn test`
5. `yarn start`
