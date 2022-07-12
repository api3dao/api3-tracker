resource "docker_image" "dockerstats" {
  name          = "wywywywy/docker_stats_exporter:latest"
  keep_locally = true
}

