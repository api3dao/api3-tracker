resource "docker_image" grafana {
    name = "grafana/grafana"
    keep_locally = true
}
