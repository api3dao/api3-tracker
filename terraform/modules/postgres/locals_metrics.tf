locals {
    metrics_shortname = "postgres-exporter"
    zone = var.zone
    
    scheme = var.zone.https == 1 ? "https": "http"
    hostname = "${local.metrics_shortname}-${local.postfix}"
    entrypoint = var.zone.entrypoint
    route = local.metrics_shortname
    metrics_service_port = 9187
    middleware_rewrite = "${local.metrics_shortname}-rewrite"
    middlewares = local.middleware_rewrite
    metrics_host = var.zone.https == 1 ? var.zone.host : "localhost"
    metrics_path = "/stats/postgres/metrics"
    metrics_rewrite_path = "/stats/postgres/"
}

locals {
    metrics_env = [
      "DATA_SOURCE_NAME=${local.connection}"
    ]
    metrics_cmd = [
    ]
}

locals {
    labels_https = [{
        label = "traefik.http.routers.${local.route}.entrypoints"
        value = "https"
    }, {
        label = "traefik.http.routers.${local.route}.tls"
        value = "true"
    }, {
        label = "traefik.http.routers.${local.route}.tls.certresolver"
        value = "le"
    }]

    labels_entrypoint = [
        {
            label = "traefik.http.routers.${local.route}.rule"
            value = "Host(`${local.metrics_host}`) && PathPrefix(`${local.metrics_path}`)"
        },
        {
            label = "traefik.http.routers.${local.route}.entrypoints"
            value = local.entrypoint
        }
    ]
    labels_service = [
        {
            label = "traefik.http.routers.${local.route}.service"
            value = "${local.metrics_shortname}@docker"
        },
        {
            label = "traefik.http.services.${local.metrics_shortname}.loadbalancer.server.port"
            value = local.metrics_service_port
        }
    ]
    labels_strip_prefix = [
        {
            label = "traefik.http.middlewares.${local.middleware_rewrite}.stripprefix.prefixes"
            value = local.metrics_rewrite_path
        }
    ]

    metrics_labels = concat(
        var.network_params.labels,
        var.zone.labels,
        local.labels_entrypoint,
        local.labels_service,
        var.zone.https == 1 ? local.labels_https : [],
        local.labels_strip_prefix,
        [{
            label = "traefik.http.routers.${local.route}.middlewares"
            value = local.middlewares
        }, {
            label = "role"
            value = local.metrics_shortname
        }]
    )
}

