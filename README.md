# API3 DAO Tracker

API3 DAO Tracker provides a web interface to see
on-chain details of the API3 DAO, including:

- Members, their stakes, shares, voting power and votings history
- Details of the votings
- All events from the smart contracts of the API3 DAO
- DAO Treasuries status

## Architecture

The app relies on Terraform to configure a generic Linux EC2 instance.
The EC2 instance in-turn hosts Docker, and app-services are orchestrated by Docker directly (eg. `restart=always`).

The services are:

```
(end user) -> Cloudflare -> EC2 IP -> traefik (load balancer) -> api3-tracker (container)
```

Containers:
- api3tracker: The FE and BE-service
- postgres: The database the FE and BE rely on
- traefik: A load balancer that encrypts HTTP responses (using the CF origin server key pair)
- postgres-exporter: a service that exports the database as a backup on an interval

Host services:
The host OS also runs some cron services, these are:
```bash
*/10 * * * * root cd /home/ubuntu/src/github.com/api3dao/api3-tracker/terraform/workspaces/api3tracker-prod && ./bin/job_logs_download.sh >> /var/log/api3-logs-download.log 2>&1
15,45 * * * * root cd /home/ubuntu/src/github.com/api3dao/api3-tracker/terraform/workspaces/api3tracker-prod && ./bin/job_supply_download.sh >> /var/log/api3-supply-download.log 2>&1
0 * * * * root cd /home/ubuntu/src/github.com/api3dao/api3-tracker/terraform/workspaces/api3tracker-prod && ./bin/job_treasuries_download.sh >> /var/log/api3-treasuries-download.log 2>&1
2,12,22,32,42,52 * * * * root cd /home/ubuntu/src/github.com/api3dao/api3-tracker/terraform/workspaces/api3tracker-prod && ./bin/job_state_update.sh >> /var/log/api3-state-update.log 2>&1
10 0 * * * root cd /home/ubuntu/src/github.com/api3dao/api3-tracker/terraform/workspaces/api3tracker-prod && ./bin/job_shares_download.sh --tag . > /var/log/api3-shares-download.log 2>&1
24 4 * * */3 root cd /home/ubuntu/src/github.com/api3dao/api3-tracker/terraform/workspaces/api3tracker-prod && bash ./bin/postgres-backup.sh >> /var/log/postgres-backups.log 2>&1
```

## Local developement using Docker
Developers can run some or all services locally using Docker Swarm, or even bare-bones, without containerisation.

One combination is running just postgres locally using Docker, eg:
```bash
docker run --rm -ti -p 5432:5432 postgres:15
```
and then running the FE and BE services directly (refer to Cron jobs below and `yarn next dev` in `package.json`).

Alternatively, one can run services using Docker Swarm, but this lacks hot-reloading.

### Local development using Docker Swarm
If you haven't already enabled Swarm mode on your Docker instance, do so now (only has to be done once):
```bash
docker swarm init
```
The result of the above command can be ignored.

Build the FE/BE image:
```bash
docker build -t api3dao/api3-tracker:latest .
```

Run the stack:
```bash
docker stack deploy -c dev-tools/docker-compose.yml tracker-stack
```

Some commands for visualising the services:
```bash
docker ps # all docker containers
docker service ls # all swarm services
docker service ps tracker-stack_postgres --no-trunc # show status of postgres
docker stack rm tracker-stack # tear down the stack
```

Initialise the DB:
```bash
DATABASE_URL="postgres://postgres:postgres@127.0.0.1:5432/postgres?sslmode=disable" yarn prisma migrate deploy
```

Cron jobs (unwrapped versions of cronjobs):
```bash
DATABASE_URL="postgres://postgres:postgres@127.0.0.1:5432/postgres?sslmode=disable" TS_NODE_PROJECT=./tsconfig.cli.json yarn ts-node cli.ts logs download
DATABASE_URL="postgres://postgres:postgres@127.0.0.1:5432/postgres?sslmode=disable" TS_NODE_PROJECT=./tsconfig.cli.json yarn ts-node cli.ts supply download
DATABASE_URL="postgres://postgres:postgres@127.0.0.1:5432/postgres?sslmode=disable" TS_NODE_PROJECT=./tsconfig.cli.json yarn ts-node cli.ts treasuries download
DATABASE_URL="postgres://postgres:postgres@127.0.0.1:5432/postgres?sslmode=disable" TS_NODE_PROJECT=./tsconfig.cli.json yarn ts-node cli.ts shares download
DATABASE_URL="postgres://postgres:postgres@127.0.0.1:5432/postgres?sslmode=disable" API3TRACKER_ENDPOINT="ARCHIVE RPC URL" TS_NODE_PROJECT=./tsconfig.cli.json yarn ts-node cli.ts state update --rps-limit
```

Keep in mind that the Postgres DB in the docker-compose file is not configured with a volume by default, so changes will be lost on service restart.

## Local Installation

The only requirements for installation are [Docker](https://docs.docker.com/get-docker/)
and [Terraform](https://learn.hashicorp.com/tutorials/terraform/install-cli).

You may also need
[AWS CLI v2](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
if you want the AWS S3 backups to be enabled on your environment

Some scripts also rely on [cURL](https://curl.se/) and [JQ](https://jqlang.github.io/jq/)

1. Prepare docker image of API3 Tracker with `make build install`
2. Please go to `terraform/workspaces/api3tracker-local` and apply
terraform plan `terraform init && terraform apply`. You should see
all resources that will be installed on your system.
You can also check running components with `docker ps`.
Default local environment starts website at [http://localhost:7040](http://localhost:7040).
3. Run `./bin/postgres-download.sh` to download the latest database backup
from AWS S3. As the database syncing is extremely slow and can take weeks,
you should take database that is ready for development

## Local Development

Once you have local terraform installation, you may run

```sh
# download dependencies
yarn
# save database credentials from terraform plan (Linux only)
# if you are not usign Linux, put DATABASE_URL in .env manually
make env
# start local development server
yarn dev
```

Open [http://localhost:3000](http://localhost:3000)
with your browser to see the result.

## License

MIT
