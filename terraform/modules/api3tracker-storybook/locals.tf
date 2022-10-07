locals {
    network_id = var.network_params.network_id
    project = var.network_params.project
    postfix = var.network_params.postfix
    zone = var.zone

    shortname = "api3tracker-storybook"
    hostname = "${local.shortname}-${local.postfix}"
    entrypoint = var.zone.entrypoint
    route = local.shortname
    service_port = 80
    host_rule = var.zone.host_rule
    scheme = var.zone.https == 1 ? "https" : "http"

    path = "/storybook/"
    rewrite_path = local.path
    middleware_rewrite = "storybook_rewrite"
    middlewares = var.restricted == 1 ? "compress,trusted,${local.middleware_rewrite}" : "compress,${local.middleware_rewrite}"
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
            label = "traefik.http.routers.${local.shortname}.rule"
            value = "${local.host_rule} && PathPrefix(`${local.path}`)"
        },
        {
            label = "traefik.http.routers.${local.route}.entrypoints"
            value = local.entrypoint
        }
    ]
    labels_service = [
        {
            label = "traefik.http.routers.${local.shortname}.service"
            value = "${local.shortname}@docker"
        },
        {
            label = "traefik.http.services.${local.shortname}.loadbalancer.server.port"
            value = local.service_port
        }
    ]
    labels_strip_prefix = [
        {
            label = "traefik.http.middlewares.${local.middleware_rewrite}.stripprefix.prefixes"
            value = local.rewrite_path
        }
    ]
    labels = concat(
        var.network_params.labels,
        var.zone.labels,
        local.labels_entrypoint,
        local.labels_service,
        local.labels_strip_prefix,
        local.middlewares == "" ? [] : [{
            label = "traefik.http.routers.${local.shortname}.middlewares"
            value = local.middlewares
        }],
        var.zone.https == 1 ? local.labels_https : [],
        [{
            label = "role"
            value = local.shortname
        }]
    )
    env = [
    ]
}
