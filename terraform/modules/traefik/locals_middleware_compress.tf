locals {
  labels_middleware_compress = [
    {
      label = "traefik.http.middlewares.compress.compress"
      value = "true"
    }
  ]
}
