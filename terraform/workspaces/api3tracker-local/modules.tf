module "api3tracker" {
  source = "../../app/api3tracker"
  trusted_ips = []
  enable_metrics = false
  https = 0
  hosted_zones = {
    # Default hosted zone of the website
    "default" = {
      name = "default"
      host = "localhost"
      local_port = 7040
    }
    # Optional - ingress configuration for Traefik dashboard
    "traefik" = {
      name = "traefik"
      host = "localhost"
      local_port = 7041
    }
  }
  workspace = "api3tracker-local"
  env = "local"
}


// For turning on s3 backup of the database,
// please ensure you defined AWS_DEFAULT_REGION,
// AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY or AWS_PROFILE or AWS_SESSION_TOKEN
// and uncomment this module

# module "s3backup" {
 # source = "../../app/s3backup"
 # network_params = module.api3tracker.network_params
# }
