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
