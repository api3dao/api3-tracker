resource "docker_image" "tgalerts" {
  name = "wcrbrm/prom-tg-alerts:latest"
  keep_locally = true
}

