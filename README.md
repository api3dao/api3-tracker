# API3 DAO Tracker

API3 DAO Tracker provides a web interface to see
on-chain details of the API3 DAO, including:

- Members, their stakes, shares, voting power and votings history
- Details of the votings
- All events from the smart contracts of the API3 DAO
- DAO Treasuries status

## Local Installation

The only requirements for installation are [Docker](https://docs.docker.com/get-docker/)
and [Terraform](https://learn.hashicorp.com/tutorials/terraform/install-cli).
You may also need
[AWS CLI v2](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) 
if you want the AWS S3 backups to be enabled on your environment

```sh
make build install
```

The command applies terraform plan and creates all necessary
docker containers to run the application. You can check running
components with `docker ps`. Default local environment opens
port at [http://localhost:7040](http://localhost:7040) with Traefik load balancer.

## VPS Installation

Same to local installation, you will need `docker` and `terraform`. Once installed,
please go to `terraform/workspaces` folder and create a folder for your environment 
by copying one of the existings environments. Edit `modules.tf` in your new folder
to set up domains, certificates and other options. Then run

```sh
terraform init
terraform apply
```
Please review the components that will be installed and approve.

## Local Development

```sh
# download dependencies
yarn
# create database (Postgres should not be running before)
yarn db:init
yarn prisma migrate:dev
# start local development server
yarn dev
```

Open [http://localhost:3000](http://localhost:3000)
with your browser to see the result.

## License
MIT
