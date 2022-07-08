module "postgres" {
  source = "../../modules/postgres"
  network_params = module.network.params
  zone = module.traefik.zone["default"]

#  exchange_params = module.s3_exchange.params
  enable_metrics = var.enable_metrics
}
