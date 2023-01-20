locals {
    nodeexporter_shortname = "nodeexporter-${var.network_params.postfix}"
    nodeexporter_route = local.nodeexporter_shortname

    nodeexporter_service_port = 9100
    nodeexporter_middleware_rewrite = "${local.nodeexporter_shortname}-rewrite"
    nodeexporter_middlewares = local.nodeexporter_middleware_rewrite
    nodeexporter_host_rule = var.zone.host_rule
    nodeexporter_path = "/stats/nodeexporter"
    nodeexporter_rewrite_path = "/stats/nodeexporter/"
}

locals {
    nodeexporter_labels_https = [{
        label = "traefik.http.routers.${local.nodeexporter_route}.entrypoints"
        value = "https"
    }, {
        label = "traefik.http.routers.${local.nodeexporter_route}.tls"
        value = "true"
    }, {
        label = "traefik.http.routers.${local.nodeexporter_route}.tls.certresolver"
        value = "le"
    }]

    nodeexporter_labels_entrypoint = [
        {
            label = "traefik.http.routers.${local.nodeexporter_route}.rule"
            value = "${local.nodeexporter_host_rule} && PathPrefix(`${local.nodeexporter_path}`)"
        },
        {
            label = "traefik.http.routers.${local.nodeexporter_route}.entrypoints"
            value = var.zone.entrypoint
        }
    ]
    nodeexporter_labels_service = [
        {
            label = "traefik.http.routers.${local.nodeexporter_route}.service"
            value = "${local.nodeexporter_shortname}@docker"
        },
        {
            label = "traefik.http.services.${local.nodeexporter_shortname}.loadbalancer.server.port"
            value = local.nodeexporter_service_port
        }
    ]
    nodeexporter_labels_strip_prefix = [
        {
            label = "traefik.http.middlewares.${local.nodeexporter_middleware_rewrite}.stripprefix.prefixes"
            value = local.nodeexporter_rewrite_path
        }
    ]

    nodeexporter_labels = concat(
        var.network_params.labels,
        var.zone.labels,
        local.nodeexporter_labels_entrypoint,
        local.nodeexporter_labels_service,
        var.zone.https == 1 ? local.nodeexporter_labels_https : [],
        local.nodeexporter_labels_strip_prefix,
        [{
            label = "traefik.http.routers.${local.nodeexporter_route}.middlewares"
            value = local.nodeexporter_middlewares
        }, {
            label = "role"
            value = local.nodeexporter_shortname
        }]
    )
}

