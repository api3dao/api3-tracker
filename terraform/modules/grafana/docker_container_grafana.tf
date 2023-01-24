resource "docker_container" grafana {
  name = "grafana-${var.zone.postfix}"
  image = docker_image.grafana.image_id
  restart = "always"

  env = local.env
  log_opts = var.network_params.log_opts

  networks_advanced {
    name  = var.zone.network_internal_id
  }
  networks_advanced {
    name  = var.zone.network_public_id
  }

  dynamic labels {
    for_each = local.labels
    content {
      label = labels.value.label
      value = labels.value.value
    }
  }

  volumes {
    volume_name = docker_volume.data.name
    read_only = false
    container_path = "/var/lib/grafana"
  }
}
