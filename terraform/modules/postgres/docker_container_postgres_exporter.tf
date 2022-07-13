resource "docker_container" "postgres_exporter" {
  count = var.enable_metrics ? 1 : 0

  image = docker_image.postgres_exporter.latest
  name = "${local.metrics_shortname}-${local.postfix}"
  restart = "always"

  env = local.metrics_env
  log_opts = var.network_params.log_opts

  networks_advanced {
    name  = local.network_id
  }
  networks_advanced {
    name  = var.zone.network_public_id
  }

  dynamic labels {
      for_each = local.metrics_labels
      content {
          label = labels.value.label
          value = labels.value.value
      }
  }
}

