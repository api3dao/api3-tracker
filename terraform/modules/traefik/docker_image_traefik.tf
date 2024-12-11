resource "docker_image" traefik {
    name = "traefik:v2.11.15"
    keep_locally = true
}
