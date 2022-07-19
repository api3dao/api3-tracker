module "api3tracker" {
  source = "../../app/api3tracker"
  trusted_ips = []
  enable_metrics = true
  enable_storybook = true
  webconfig = file("./webconfig.yaml")

  https = 1
  hosted_zones = {
    # Default hosted zone of the website
    "default" = {
      name = "default"
      host = "api3-tracker.api3.org"
      local_port = 0
    }
  }
  workspace = "api3tracker-prod"
  env = "prod"

  certificates = [
    {
       name = "api3-tracker",
       certificate = file(pathexpand("/home/ubuntu/origin-certificates/api3-tracker.api3.org.crt")),
       private_key = file(pathexpand("/home/ubuntu/origin-certificates/api3-tracker.api3.org.key")),
    }
  ]

}


// For turning on s3 backup of the database,
// please ensure you defined AWS_DEFAULT_REGION,
// AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY or AWS_PROFILE or AWS_SESSION_TOKEN
// and uncomment this module

# module "s3backup" {
 # source = "../../app/s3backup"
 # network_params = module.api3tracker.network_params
# }

