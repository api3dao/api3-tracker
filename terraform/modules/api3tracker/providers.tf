terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "2.23.1"
    }
  }
}

provider "docker" {
  host = "unix:///var/run/docker.sock"

# registry_auth {
#     address = var.registry
#     config_file = pathexpand("${path.module}/../.docker/config.json")
# }
}

