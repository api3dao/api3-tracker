EXECUTABLES = docker terraform
K := $(foreach exec,$(EXECUTABLES),\
        $(if $(shell which $(exec)),some string,$(error "No $(exec) in PATH")))
LOCALPORT := $(shell cat terraform/workspaces/api3tracker-local/modules.tf | grep -A2 'name = "default"' | grep local_port | head -n1 | grep -oE '[^ ]+$$')
LOCALPORT2 := $(shell cat terraform/workspaces/api3tracker-local/modules.tf | grep -A2 'name = "traefik"' | grep local_port | head -n1 | grep -oE '[^ ]+$$')

build:
	docker build -t api3tracker .

install:
	@cd terraform/workspaces/api3tracker-local && \
	terraform init && \
	terraform apply -auto-approve && \
	echo Traefik server should be running at http://localhost:${LOCALPORT}/ && \
	echo Storybook should be running at http://localhost:${LOCALPORT}/storybook/ && \
	echo Traefik dashboard should be running at http://localhost:${LOCALPORT2}/

uninstall:
	cd terraform/workspaces/api3tracker-local && \
	terraform destroy -auto-approve

validate:
	cd terraform/workspaces/api3tracker-local && \
	terraform validate

sasa:
	API3TRACKER_ENDPOINT=none yarn state:update --stop-block 15610110 --verbose-blocks true --verbose-member 0x74e3591425325a35e41e0e230d7d8686c7912ab4
heikki:
	API3TRACKER_ENDPOINT=none yarn state:update --stop-block 12818666 --verbose-blocks true --verbose-member 0xe0d6480ae69e7c4928a3f45e6cf5651e52741ec0
