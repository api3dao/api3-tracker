variable api3tracker_endpoint {
  type = string
}

variable api3tracker_archive_endpoint {
  type = string
}

variable coingecko_host {
  type = string
  default = "api.coingecko.com"
}

variable coingecko_api_key {
  type = string
  default = ""
}

module "api3tracker" {
  source = "../../app/api3tracker"
  trusted_ips = []
  enable_metrics = false
  enable_server_monitoring = false

  https = 0
  hosted_zones = {
    # Default hosted zone of the website
    "default" = {
      name = "default"
      hosts = ["localhost", "127.0.0.1"]
      local_port = 7040
    }
    # Optional - ingress configuration for Traefik dashboard
    "traefik" = {
      name = "traefik"
      hosts = ["localhost", "127.0.0.1"]
      local_port = 7041
    }
  }
  workspace = "api3tracker-local"
  env = "local"

  endpoints = {
    default = var.api3tracker_endpoint
    archive = var.api3tracker_archive_endpoint
  }

  coingecko = {
    host = var.coingecko_host
    api_key = var.coingecko_api_key
  }

  // backups s3 configuration
  aws_backup = {
    profile = "s3_backup"
    bucket = "api3-dao-tracker-backups"
    path = "tracker"
    exchange_dir = "${path.cwd}/exchange"
  }
}


// For turning on s3 backup of the database,
// please ensure you defined AWS_DEFAULT_REGION,
// AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY or AWS_PROFILE or AWS_SESSION_TOKEN
// and uncomment this module

# module "s3backup" {
 # source = "../../app/s3backup"
 # network_params = module.api3tracker.network_params
# }
