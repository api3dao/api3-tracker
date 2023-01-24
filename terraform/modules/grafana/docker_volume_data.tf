resource "docker_volume" data {
    name = "${var.zone.project}-grafana-data-${var.zone.postfix}"
}
