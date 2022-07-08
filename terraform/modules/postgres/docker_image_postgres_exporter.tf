resource "docker_image" "postgres_exporter" {
  name = "quay.io/prometheuscommunity/postgres-exporter"
  keep_locally = true
}
