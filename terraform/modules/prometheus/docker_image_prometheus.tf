resource "docker_image" "prometheus" {
  name         = "bitnami/prometheus:latest"
  keep_locally = true
}

