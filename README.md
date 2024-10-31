# API3 DAO Tracker

API3 DAO Tracker provides a web interface to see
on-chain details of the API3 DAO, including:

- Members, their stakes, shares, voting power, and voting history
- Proposal details
- All events from the smart contracts of the API3 DAO
- DAO Treasuries status

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
