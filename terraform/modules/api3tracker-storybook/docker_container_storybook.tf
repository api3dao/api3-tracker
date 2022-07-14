resource "docker_container" "storybook" {
  count = var.enable ? 1 : 0
  image = docker_image.storybook.latest
  name  = local.hostname
  restart = "always"

  env = local.env
  log_opts = var.network_params.log_opts

  networks_advanced {
      name  = local.network_id
  }
  networks_advanced {
      name  = local.zone.network_public_id
  }

  dynamic labels {
      for_each = local.labels
      content {
          label = labels.value.label
          value = labels.value.value
      }
  }
}

