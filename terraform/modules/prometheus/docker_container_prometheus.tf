resource "docker_container" prometheus {
  name = "prometheus-${local.postfix}"
  image = docker_image.prometheus.image_id
  restart = "always"

  //  entrypoint = ["sh", "-c", "cat /etc/prometheus/prometheus.yml"]
  command = local.command
  env = local.env
  log_opts = var.network_params.log_opts

  networks_advanced {
    name  = var.zone.network_internal_id
  }
  networks_advanced {
    name  = var.zone.network_public_id
  }

  volumes {
    volume_name = docker_volume.data.name
    read_only = false
    container_path = "/prometheus"
  }

  upload {
    content = file(pathexpand("${path.module}/cfg/node_exporter.rules.yml"))
    file = "/etc/prometheus/node_exporter.rules.yml"
    executable = false
  }
  upload {
    content = file(pathexpand("${path.module}/cfg/postgres.rules.yml"))
    file = "/etc/prometheus/postgres.rules.yml"
    executable = false
  }
  upload {
    content = file(pathexpand("${path.module}/cfg/blackbox.rules.yml"))
    file = "/etc/prometheus/blackbox.rules.yml"
    executable = false
  }
  upload {
    content = file(pathexpand("${path.module}/cfg/api3tracker.rules.yml"))
    file = "/etc/prometheus/api3tracker.rules.yml"
    executable = false
  }

  dynamic upload {
    for_each = local.upload
    content {
      content = upload.value.content
      file = upload.value.file
      executable = false
    }
  }

  upload {
    content    = local.config
    executable = false
    file = "/etc/prometheus/prometheus.yml"
  }

  dynamic labels {
    for_each = local.labels
    content {
      label = labels.value.label
      value = labels.value.value
    }
  }
}
