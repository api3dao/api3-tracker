resource "docker_volume" "data" {
    name = "${local.project}-tgbot-data-${local.postfix}"
}
