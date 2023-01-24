resource "docker_container" prometheus_blackbox {
  count = length(var.https_probes) > 0 ? 1 : 0
  name = "prometheus-blackbox-${local.postfix}"
  image = docker_image.prometheus_blackbox.image_id
  restart = "always"

  command = [ "--config.file=/config/blackbox.yml" ]
  env = []
  log_opts = var.network_params.log_opts

  networks_advanced {
    name  = var.zone.network_internal_id
  }

  upload {
    content = local.blackbox_config
    file = "/config/blackbox.yml"
    executable = false
  }

  ports {
    internal = 9115
    external = 9115
  }
}
