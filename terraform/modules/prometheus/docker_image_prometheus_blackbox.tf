resource "docker_image" "prometheus_blackbox" {
  name         = "prom/blackbox-exporter:master"
  keep_locally = true
}

