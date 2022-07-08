output "pid" {
  value = docker_container.postgres.id
  description = "Docker container ID that is available once postgres is running"
}

