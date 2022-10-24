locals {
  // ## Properties of the dashboard
  // unfortunately dashboard works only from web root
  // and requires separate 'traefik' entrypoint in your zones configuration
  dashboard_zone = lookup(var.hosted_zones, "traefik", { name = "", hosts = ["localhost", "127.0.0.1"], host_rule = "Host(`localhost`)", www_rule = "", local_port = 8080 })

  dashboard_host_rule = local.dashboard_zone.host_rule
  dashboard_router = "traefikapi"
  dashboard_middlewares = "trusted"

  labels_route_dashboard = length(local.dashboard_zone.name) == 0 ? [] : [
    {
      label = "traefik.http.routers.${local.dashboard_router}.rule"
      value = local.dashboard_host_rule
    },
    {
      label = "traefik.http.routers.${local.dashboard_router}.entrypoints"
      value = local.dashboard_zone.name
    },
    {
      label = "traefik.http.routers.${local.dashboard_router}.service"
      value = "api@internal"
    },
    {
      label = "traefik.http.routers.${local.dashboard_router}.middlewares"
      value = local.dashboard_middlewares
    }
  ]
}


