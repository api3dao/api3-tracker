resource "docker_volume" certificates {
    name = "${local.project}-certificates-${local.postfix}"
}

