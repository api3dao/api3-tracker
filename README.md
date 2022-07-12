# API3 DAO Tracker

API3 DAO Tracker provides a web interface to see
on-chain details of the API3 DAO, including:

- Members, their stakes, shares, voting power and votings history
- Details of the votings
- All events from the smart contracts of the API3 DAO
- DAO Treasuries status

## Local Installation

The only requirements for installation are [https://docs.docker.com/get-docker/](Docker)
and [https://learn.hashicorp.com/tutorials/terraform/install-cli](Terraform).
You may also need AWS CLI v2 if you want the backup to be enabled

```sh
make build install
```

The command applies terraform plan and creates all necessary
docker containers to run the application. You can check running
components with `docker ps`. Default local environment opens
port at [http://localhost:7040](http://localhost:7040) with Traefik load balancer.

## Local Development

```sh
# download dependencies
yarn
# create database (Postgres should not be running before)
yarn db:init
# start local development server
yarn dev
```

Open [http://localhost:3000](http://localhost:3000)
with your browser to see the result.

## License
MIT
