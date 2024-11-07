include .env
export

environment ?= "development"

node_modules:
	npm ci --no-optional

seed:
	node bin/generate.js

migrate:
	NODE_ENV=$(environment) ./node_modules/.bin/knex migrate:latest

create_migration:
	NODE_ENV=$(environment) ./node_modules/.bin/knex migrate:make $(name)

migrate_develop:
	NODE_ENV=$(environment) ./node_modules/.bin/knex migrate:rollback $(name)
	NODE_ENV=$(environment) ./node_modules/.bin/knex migrate:latest

restore:
	-rm dev.sqlite3
	./node_modules/.bin/knex migrate:latest

demo: restore
	sqlite3 dev.sqlite3 < database/demo-data.sqlite.sql

survey: demo
	sqlite3 dev.sqlite3 < database/demo-survey.sqlite.sql
