resource "docker_volume" "data" {
    name = "${var.zone.project}-prometheus-data-${var.zone.postfix}"
}
