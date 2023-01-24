module "grafana" {
  source = "./../../modules/grafana"
  network_params = module.network.params
  zone = module.traefik.zone["default"]
  admin_password = var.grafana_password
}

