locals {
  labels_route_www = [
    {
      label = "traefik.http.middlewares.www.redirectregex.regex"
      value = "https?://www\\.(.+)",
    },
    {
      label = "traefik.http.middlewares.www.redirectregex.replacement"
      value = "https://$1",
    },
    {
      label = "traefik.http.middlewares.www.redirectregex.permanent"
      value = "true",
    },
    {
      label = "traefik.http.routers.${local.www}.rule"
      value = local.default_www_rule
    },
    {
      label = "traefik.http.routers.${local.www}.entrypoints"
      value = local.default_entrypoint
    },
    {
      label = "traefik.http.routers.${local.www}.service"
      value = "api@internal"
    },
    {
      label = "traefik.http.routers.${local.www}.middlewares"
      value = "www"
    }
  ]
}


