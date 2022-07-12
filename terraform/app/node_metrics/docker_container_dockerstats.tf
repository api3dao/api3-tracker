resource "docker_container" dockerstats {
    image = docker_image.dockerstats.latest
    name  = "dockerstats"
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
}

