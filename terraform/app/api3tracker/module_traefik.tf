module "traefik" {
  source = "../../modules/traefik"

  network_params = module.network.params
  https = var.https
  trusted_ips = var.trusted_ips
  hosted_zones = {
      for name, z in var.hosted_zones : name => {
            name = z.name
            hosts = z.hosts
            local_port = z.local_port
            host_rule = var.https == 1 ? format("(%s)", join(" || ", formatlist("Host(`%s`)", z.hosts))) : "Host(`localhost`)"
            www_rule = var.https == 1 ? format("(%s)", join(" || ", formatlist("Host(`www.%s`)", z.hosts))) : ""
      }
  }
  certificates = var.certificates
  # geoip_url = module.geoip.url
  jaeger_endpoint = var.jaeger_endpoint
}
