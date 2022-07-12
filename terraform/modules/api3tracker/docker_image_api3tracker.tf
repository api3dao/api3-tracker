resource "docker_image" "api3tracker" {
  name         = var.registry != "" ? "${var.registry}/api3tracker:latest" : "api3tracker:latest"
  keep_locally = true
}

