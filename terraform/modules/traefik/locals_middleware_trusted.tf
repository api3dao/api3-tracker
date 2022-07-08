  locals {
    // List of reusable middlewares for other services
    labels_middleware_trusted = length(var.trusted_ips) == 0 ? [
      {
        label = "traefik.http.middlewares.trusted.headers.customresponseheaders.X-Trusted"
        value = "1"
      }
    ] : [
      {
        label = "traefik.http.middlewares.trusted.ipwhitelist.sourcerange"
        value = join(", ", var.trusted_ips)
      }
    ]
  }
