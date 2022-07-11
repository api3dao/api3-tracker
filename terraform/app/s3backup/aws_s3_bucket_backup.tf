resource "aws_s3_bucket" "backup" {
  bucket = "backup-${var.network_params.postfix}"

  tags = {
    role      = "backup"
    project   = var.network_params.project
    workspace = var.network_params.workspace
    env       = var.network_params.env
    autoclean = "true"
  }
}

