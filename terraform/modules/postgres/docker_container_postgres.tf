resource "docker_container" "postgres" {
  image = docker_image.postgres.latest
  name = local.host
  restart = "always"

  env = local.env
  log_opts = var.network_params.log_opts

  networks_advanced {
    name  = local.network_id
  }

 #  mounts {
 #   read_only = false
 #   source = local.volume_exchange
 #   target = "/exchange"
 #   type = "bind"
 # }

  volumes {
    container_path = "/postgresql/data"
    read_only = false
    volume_name = docker_volume.storage.name
  }

  dynamic labels {
    for_each = local.labels
    content {
      label = labels.value.label
      value = labels.value.value
    }
  }
}

