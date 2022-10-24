locals {
  network_id = var.network_params.network_id
  project = var.network_params.project
  postfix = var.network_params.postfix

  host = "postgres-${var.network_params.postfix}"
  port = 5432
  user = "${var.network_params.project}${var.network_params.postfix}"
  password = random_string.password.result
  root_user = "r${var.network_params.project}${var.network_params.postfix}"
  root_password = random_string.root_password.result
  database = "${var.network_params.project}${var.network_params.postfix}"

  connection = "postgres://${local.root_user}:${local.root_password}@${local.host}:${local.port}/${local.database}?sslmode=disable"
  aws_profile = var.aws_backup.profile
  aws_backup_bucket = var.aws_backup.bucket
  aws_backup_path = var.aws_backup.path
  volume_exchange = var.aws_backup.exchange_dir
}

locals {

  env = [
    "POSTGRES_USER=${local.root_user}",
    "POSTGRES_PASSWORD=${local.root_password}",
    "POSTGRES_DB=${local.database}",
    "PGDATA=/postgresql/data"
  ]

  labels = [
    { "label": "host", "value": local.host },
    { "label": "project", "value": local.project },
    { "label": "role", "value": "postgres" }
  ]
}
