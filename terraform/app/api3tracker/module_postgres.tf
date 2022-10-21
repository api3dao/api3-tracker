module "postgres" {
  source = "../../modules/postgres"
  network_params = module.network.params
  zone = module.traefik.zone["default"]

  enable_metrics = var.enable_metrics
  aws_backup = var.aws_backup
}
