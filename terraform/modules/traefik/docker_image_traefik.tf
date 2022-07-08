resource "docker_image" traefik {
    name = "traefik:v2.6.3"
    keep_locally = true
}
