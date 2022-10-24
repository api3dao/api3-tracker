variable aws_backup {
  type = object({
    profile = string
    bucket = string
    path = string
    exchange_dir = string
  })
  default = {
    profile = "default"
    bucket = ""
    path = ""
    exchange_dir = "/opt/exchange"
  }
  description = "AWS profile name if backups are enabled"
}

