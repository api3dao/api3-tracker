resource "docker_network" internal {
  name = "${var.project}-internal-${var.postfix}"
}

