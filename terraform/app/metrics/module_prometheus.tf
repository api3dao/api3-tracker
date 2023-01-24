module "prometheus" {
  source = "../../modules/prometheus"
  network_params = module.network.params
  zone = module.traefik.zone["default"]

  # additional prometheus jobs
  jobs = local.prometheus_jobs

  # additional prometheus rules
  # rules = local.prometheus_rules

  # probes for prometheus blackbox
  https_probes = local.https_probes
  http_probes = local.http_probes
}

