locals {
    dockerstats_shortname = "dockerstats"
    dockerstats_route = "dockerstats"

    dockerstats_service_port = 9487
    dockerstats_middleware_rewrite = "${local.dockerstats_shortname}-rewrite"
    dockerstats_middlewares = local.dockerstats_middleware_rewrite
    dockerstats_host_rule = var.zone.host_rule
    dockerstats_path = "/stats/dockerstats"
    dockerstats_rewrite_path = "/stats/dockerstats/"
}

locals {
    dockerstats_labels_https = [{
        label = "traefik.http.routers.${local.dockerstats_route}.entrypoints"
        value = "https"
    }, {
        label = "traefik.http.routers.${local.dockerstats_route}.tls"
        value = "true"
    }, {
        label = "traefik.http.routers.${local.dockerstats_route}.tls.certresolver"
        value = "le"
    }]

    dockerstats_labels_entrypoint = [
        {
            label = "traefik.http.routers.${local.dockerstats_route}.rule"
            value = "${local.dockerstats_host_rule} && PathPrefix(`${local.dockerstats_path}`)"
        },
        {
            label = "traefik.http.routers.${local.dockerstats_route}.entrypoints"
            value = var.zone.entrypoint
        }
    ]
    dockerstats_labels_service = [
        {
            label = "traefik.http.routers.${local.dockerstats_route}.service"
            value = "${local.dockerstats_shortname}@docker"
        },
        {
            label = "traefik.http.services.${local.dockerstats_shortname}.loadbalancer.server.port"
            value = local.dockerstats_service_port
        }
    ]
    dockerstats_labels_strip_prefix = [
        {
            label = "traefik.http.middlewares.${local.dockerstats_middleware_rewrite}.stripprefix.prefixes"
            value = local.dockerstats_rewrite_path
        }
    ]

    dockerstats_labels = concat(
        var.network_params.labels,
        var.zone.labels,
        local.dockerstats_labels_entrypoint,
        local.dockerstats_labels_service,
        var.zone.https == 1 ? local.dockerstats_labels_https : [],
        local.dockerstats_labels_strip_prefix,
        [{
            label = "traefik.http.routers.${local.dockerstats_route}.middlewares"
            value = local.dockerstats_middlewares
        }, {
            label = "role"
            value = local.dockerstats_shortname
        }]
    )
}

