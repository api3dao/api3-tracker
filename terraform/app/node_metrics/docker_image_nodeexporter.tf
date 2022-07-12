resource "docker_image" "nodeexporter" {
  name         = "quay.io/prometheus/node-exporter:latest"
  keep_locally = true
}

