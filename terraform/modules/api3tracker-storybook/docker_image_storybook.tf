resource "docker_image" "storybook" {
  name         = var.enable ? (
    var.registry != "" ? "${var.registry}/api3tracker-storybook:latest" : "api3tracker-storybook:latest"
  ) : "alpine"
  keep_locally = true
}

