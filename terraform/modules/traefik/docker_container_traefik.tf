resource "docker_container" traefik {
  name = local.hostname
  image = docker_image.traefik.latest
  restart = "always"

  command = local.command
  env = local.env
  log_opts = var.network_params.log_opts 
  
  networks_advanced {
    name  = docker_network.public.id
  }

  dynamic ports {
    for_each = local.ports
    content {
      internal = ports.value.internal
      external = ports.value.external
    }
  }

  dynamic labels {
    for_each = local.labels_container
    content {
      label = labels.value.label
      value = labels.value.value
    }
  }

  dynamic upload {
    for_each = local.upload
    content {
      file = upload.value.file
      content = upload.value.content
      executable = false
    }
  }

  volumes {
    volume_name = docker_volume.certificates.name
    read_only = false
    container_path = "/certificates"
  }
  mounts {
    source = "/var/run/docker.sock"
    target = "/var/run/docker.sock"
    type      = "bind"
    read_only = true
  }
}

