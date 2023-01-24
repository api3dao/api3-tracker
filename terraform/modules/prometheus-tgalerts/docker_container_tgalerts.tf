resource "docker_container" tgalerts {
  image = docker_image.tgalerts.image_id
  name  = local.hostname
  restart = "always"

  env = local.env
  log_opts = var.network_params.log_opts

  networks_advanced {
    name  = local.network_id
  }

  dynamic labels {
    for_each = local.labels
    content {
      label = labels.value.label
      value = labels.value.value
    }
  }
}

