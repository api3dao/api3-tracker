variable api3tracker_endpoint {
  type = string
}

module "api3tracker" {
  source = "../../app/api3tracker"
  trusted_ips = []
  enable_metrics = false
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
  // Hint: use TF_VAR_api3tracker_endpoint to set this up, pointing to Infura or Alchemy JSON+RPC provider
  endpoint = var.api3tracker_endpoint

  // backups s3 configuration
  aws_backup = {
    profile = "tracker"
    bucket = "dao-tracker-backups"
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
