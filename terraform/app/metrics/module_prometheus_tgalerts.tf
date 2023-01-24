module "prometheus-tgalerts" {
  source = "../../modules/prometheus-tgalerts"
  network_params = module.network.params
  telegram = var.telegram
  alerts_url = "${module.prometheus.url}api/v1/alerts"
}

