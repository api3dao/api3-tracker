resource "docker_image" "postgres" {
  name = "postgres:12.0"
  keep_locally = true
}
