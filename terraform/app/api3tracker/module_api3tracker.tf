module "api3tracker" {
  source = "../../modules/api3tracker"

  network_params = module.network.params
  registry = var.registry
  zone = module.traefik.zone["default"]
  endpoint = var.endpoints.default
  webconfig = var.webconfig
  connection = module.postgres.connection
}
