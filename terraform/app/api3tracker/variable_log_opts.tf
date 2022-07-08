variable log_opts {
  type = map
  description = "Logging options for docker containers"
  default = {
    "max-file" = "3"
    "max-size" = "100m"
  }
}
