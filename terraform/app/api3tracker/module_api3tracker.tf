module "api3tracker" {
  source = "../../modules/api3tracker"

  network_params = module.network.params
  registry = var.registry
  zone = module.traefik.zone["default"]
  webconfig = var.webconfig

#  postgres_connection = module.postgres.connection
}
