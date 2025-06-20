#!/usr/bin/make -f

MAKEFLAGS += --silent

# Default target
.DEFAULT_GOAL := help

seeder ?= ''
env ?= development
$(shell cp .config/environments/.env.$(env) .env)
include .env
export $(shell sed 's/=.*//' .env)


GitRepo = pos-apps

# Variables
PNPM := pnpm
NX := $(PNPM) exec nx

noop =
comma := ,
space = $(noop) $(noop)

OS := $(shell uname)

nprocs := 2

ifeq ($(OS), Linux)
    nprocs = $(shell nproc)
endif
ifeq ($(OS), Darwin)
    nprocs = $(shell sysctl -n hw.ncpu)
endif

install: FORCE

updateDeps:
	pnpm install --frozen-lockfile125

deploy:
	${MAKE} build env=$(env)
	${MAKE} pm2.restart env=$(env)
	${MAKE} nginx.restart

env.set:
	@if [ ! -f .config/environments/.env.$(env) ]; then \
	  echo "\033[1;32mMissing environment file: .env.$(env).\033[0m"; \
	  exit 1; \
	fi

	cp .config/environments/.env.$(env) .env

	for path in ./apps/gateway ./dist/apps/gateway ./apps/go-api ./dist/apps; do \
		mkdir -p $$path; \
		cp .env $$path/.env; \
	done

	@echo "\033[1;32m$(env) environment variables are set.\033[0m"

build: env.set
	nx run-many --target=build --projects=gateway,pos-portal --parallel=$(nprocs) --configuration=$(env) --exclude='workspace' ; \
	$(MAKE) env.set env=$(env)

build.%: env.set
	npx nx run $*:build:$(env)
	$(MAKE) env.set env=$(env)

dev: env.set
	nx run-many --target=serve --projects=gateway,pos-portal --parallel=$(nprocs) --configuration=$(env) --exclude='workspace' ; \
	$(MAKE) env.set

dev.%: env.set
	@echo "Starting $* in development mode..."
	nx run $*:serve

deploy.gateway: db.seed.all
	$(MAKE) env.set env=$(env)
	npx env-cmd -f dist/apps/gateway/.env node dist/apps/gateway/main.js
	$(MAKE) env.set env=$(env)

format:
	nx format:write

release.patch:
	nx run workspace:version --releaseAs=patch

release.minor:
	nx run workspace:version --releaseAs=minor

release.major:
	nx run workspace:version --releaseAs=major

release.pre:
	nx run workspace:version --releaseAs=premajor --preid=beta

release.pre.beta:
	nx run workspace:version --releaseAs=prerelease --preid=beta

release.pre.alpha:
	nx run workspace:version --releaseAs=prerelease --preid=alpha

cpus:
	@echo "Number of CPUs: $(nprocs)"

pm2.start:
	env-cmd -f ./dist/apps/gateway/.env pm2 start ./dist/apps/gateway/main.js --name sh-index-pos-api-$(env)

pm2.stop:
	pm2 stop sh-index-pos-api-$(env)

pm2.restart:
	env-cmd -f ./dist/apps/gateway/.env pm2 restart sh-index-pos-api-$(env) --update-env

pm2.delete:
	pm2 delete sh-index-pos-api-$(env)

nginx.config:
	sudo cat /var/www/pos-apps/.config/nginx/sh.index-pos.com.conf | sudo tee /etc/nginx/sites-available/sh.index-pos.com.conf > /dev/null

nginx.sym:
	sudo ln -s /etc/nginx/sites-available/sh.index-pos.com.conf /etc/nginx/sites-enabled

nginx.restart:
	sudo systemctl restart nginx

nginx.test:
	sudo nginx -t

nginx.reload:
	sudo service nginx reload

db.seed.create:
	npx sequelize seed:create --name $(seeder)

db.seed.all:
	npx sequelize db:seed:all --env $(env)

docker.up: env.set
	docker compose up

