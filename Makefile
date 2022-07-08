EXECUTABLES = docker terraform
K := $(foreach exec,$(EXECUTABLES),\
        $(if $(shell which $(exec)),some string,$(error "No $(exec) in PATH")))

build:
	docker build -t api3tracker .

install:
	cd terraform/workspaces/api3tracker-local && \
	terraform init && \
	terraform apply -auto-approve

uninstall:
	cd terraform/workspaces/api3tracker-local && \
	terraform destroy -auto-approve


