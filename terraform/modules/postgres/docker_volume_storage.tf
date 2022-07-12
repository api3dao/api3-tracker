resource "docker_volume" "storage" {
  name = "${local.project}-postgres-storage-${local.postfix}"
}

