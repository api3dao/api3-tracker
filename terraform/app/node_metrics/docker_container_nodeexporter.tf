resource "docker_container" nodeexporter {
    image = docker_image.nodeexporter.latest
    name  = "nodeexporter"
    restart = "always"
    command = ["--path.rootfs=/host"]

    network_mode = "host"
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
}

