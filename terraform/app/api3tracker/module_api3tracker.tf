module "api3tracker" {
  source = "../../modules/api3tracker"

  network_params = module.network.params
  registry = var.registry
  zone = module.traefik.zone["default"]
  endpoints = var.endpoints
  webconfig = var.webconfig
  connection = module.postgres.connection
}
