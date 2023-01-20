resource "docker_container" nodeexporter {
    count = var.enable ? 1 : 0

    image = docker_image.nodeexporter.latest
    name  = "${local.nodeexporter_shortname}-${var.network_params.postfix}"

    restart = "always"
    command = ["--path.rootfs=/host"]

    // network_mode = "host"
    pid_mode = "host"

    labels {
        label = "role"
        value = "nodeexporter"
    }
    mounts {
        read_only = true
        source = "/"
        target = "/host"
        type   = "bind"
        bind_options {
            propagation = "rslave"
        }
    }
    log_opts = var.network_params.log_opts

    networks_advanced {
        name  = var.network_params.network_id
    }

    networks_advanced {
        name  = var.zone.network_public_id
    }

    dynamic labels {
        for_each = local.nodeexporter_labels
        content {
            label = labels.value.label
            value = labels.value.value
        }
    }
}
