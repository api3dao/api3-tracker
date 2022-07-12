locals {
  labels_middleware_geo = [
    {
      label = "traefik.http.middlewares.geo.forwardauth.address"
      value = var.geoip_url
    },
    {
      label = "traefik.http.middlewares.geo.forwardauth.trustForwardHeader"
      value = "true"
    },
    {
      label = "traefik.http.middlewares.geo.forwardauth.authResponseHeaders"
      value = "X-Real-Ip, X-Country-Code, X-Country-EN-Name, X-City-EN-Name, X-Location-Lat, X-Location-Lon"
    }
  ]
}

