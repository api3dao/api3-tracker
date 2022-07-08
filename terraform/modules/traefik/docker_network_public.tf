resource "docker_network" public {
  name = "${local.project}-public-${local.postfix}"
}

