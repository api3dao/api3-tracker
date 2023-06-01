variable aws_profile {
  type = string
  default = "default"
}

variable api3tracker_archive_endpoint {
  type = string
}

variable api3tracker_endpoint {
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
  enable_metrics = true
  enable_server_monitoring = true
  webconfig = file("./webconfig.yaml")

  https = 1
  hosted_zones = {
    # Default hosted zone of the website
    "default" = {
      name = "default"
      hosts = ["api3-tracker.api3.org", "dao-tracker.api3.org", "tracker.api3.org"]
      local_port = 0
    }
  }
  workspace = "api3tracker-prod"
  env = "prod"

  certificates = [
    {
       name = "tracker",
       certificate = file(pathexpand("/home/ubuntu/origin-certificates/tracker.api3.org.crt")),
       private_key = file(pathexpand("/home/ubuntu/origin-certificates/tracker.api3.org.key")),
    },
    {
       name = "api3-tracker",
       certificate = file(pathexpand("/home/ubuntu/origin-certificates/api3-tracker.api3.org.crt")),
       private_key = file(pathexpand("/home/ubuntu/origin-certificates/api3-tracker.api3.org.key")),
    }
  ]

  // Hint: use terraform.tfvars to set this up securely,
  // pointing to Infura or Alchemy JSON+RPC provider
  endpoints = {
    default = var.api3tracker_endpoint
    archive = var.api3tracker_archive_endpoint
  }
  // Hint: use terraform.tfvars to set this up securely
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

