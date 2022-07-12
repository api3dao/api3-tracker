module "traefik" {
  source = "../../modules/traefik"

  network_params = module.network.params
  https = var.https
  trusted_ips = var.trusted_ips
  hosted_zones = {
      for name, z in var.hosted_zones : name => {
            name = z.name
            host = z.host
            local_port = z.local_port
      }
  }
  certificates = var.certificates
  # geoip_url = module.geoip.url
  jaeger_endpoint = var.jaeger_endpoint
}
