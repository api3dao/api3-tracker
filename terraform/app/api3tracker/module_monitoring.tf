module "monitoring" {
  source = "../../modules/monitoring"

  network_params = module.network.params
  zone = module.traefik.zone["default"]
  enable = var.enable_server_monitoring
}

