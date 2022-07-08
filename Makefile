EXECUTABLES = docker terraform
K := $(foreach exec,$(EXECUTABLES),\
        $(if $(shell which $(exec)),some string,$(error "No $(exec) in PATH")))
LOCALPORT := $(shell cat terraform/workspaces/api3tracker-local/modules.tf | grep port | head -n1 | grep -oE '[^ ]+$$')

build:
	docker build -t api3tracker .

install:
	cd terraform/workspaces/api3tracker-local && \
	terraform init && \
	terraform apply -auto-approve && \
	echo Traefik server should be running at http://localhost:${LOCALPORT}/

uninstall:
	cd terraform/workspaces/api3tracker-local && \
	terraform destroy -auto-approve


