variable grafana_password {
  type = string
}
variable telegram_bot_token {
  type = string
}
variable telegram_chat_id {
  type = string
}

module monitoring {
  source = "../../app/metrics"

  trusted_ips = []
  https = 0

  hosted_zones = {
    "default" = {
      name = "default"
      hosts = ["localhost", "127.0.0.1"]
      local_port = 8950
    }
    // DO NOT EXPOSE TRAEFIK:
    "traefik" = {
      name = "traefik"
      hosts = ["localhost", "127.0.0.1"]
      local_port = 8951
    }
  }

  workspace = "metrics-local"
  env = "local"

  # admin password for grafana (keep in terraform.tfvars)
  grafana_password = var.grafana_password

  # servers to be monitored (by IP address)
  api3tracker_host = "tracker.api3.org"

  # bot and group are taken from terraform.tfvars
  telegram = {
    bot_token = var.telegram_bot_token
    chat_id = var.telegram_chat_id
  }
}
