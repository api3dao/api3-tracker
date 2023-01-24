
locals {
    network_id = var.network_params.network_id
    project = var.network_params.project
    postfix = var.network_params.postfix

    // external settings
    shortname = "prometheus"
    hostname = "${local.shortname}-${local.postfix}"
    entrypoint = var.zone.entrypoint
    route = local.shortname
    service_port = 9090
    host_rule = var.zone.host_rule
    scheme = var.zone.https == 1 ? "https": "http"

    middleware_rewrite = "${local.shortname}-rewrite"
    middlewares = "" #  var.zone.https == 1 ? "trusted": ""

    path = "/prometheus/"
    host0 = var.zone.https == 1 ? var.zone.hosts[0] : "${var.zone.hosts[0]}:${var.zone.local_port}"
    url = "${local.scheme}://${local.host0}${local.path}"
}

locals {
    upload = [
    ]

    env = [
    ]

    command = [
        "--config.file=/etc/prometheus/prometheus.yml",
        "--web.external-url=${local.url}",
        "--web.route-prefix=${local.path}",
        "--storage.tsdb.path=/prometheus",
        "--web.console.libraries=/usr/share/prometheus/console_libraries",
        "--web.console.templates=/usr/share/prometheus/consoles"
    ]

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
            value = "${local.host_rule} && PathPrefix(`${local.path}`)"
        },
        {
            label = "traefik.http.routers.${local.route}.entrypoints"
            value = local.entrypoint
        }
    ]
    labels_service = [
        {
            label = "traefik.http.routers.${local.route}.service"
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
            value = local.path
        }
    ]

    labels = concat(
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
            value = local.shortname
        }]
    )
}
