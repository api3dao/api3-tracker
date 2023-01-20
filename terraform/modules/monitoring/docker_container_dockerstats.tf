resource "docker_container" dockerstats {
    count = var.enable ? 1 : 0

    image = docker_image.dockerstats.latest
    name  = "${local.dockerstats_shortname}-${var.network_params.postfix}"
    restart = "always"

    ports {
        internal = 9487
        external = 9487
    }

    labels {
        label = "role"
        value = "dockerstats"
    }

    mounts {
        source = "/var/run/docker.sock"
        target = "/var/run/docker.sock"
        type   = "bind"
    }

    log_opts = var.network_params.log_opts

    networks_advanced {
        name  = var.network_params.network_id
    }

    networks_advanced {
        name  = var.zone.network_public_id
    }

    dynamic labels {
        for_each = local.dockerstats_labels
        content {
            label = labels.value.label
            value = labels.value.value
        }
    }
}

