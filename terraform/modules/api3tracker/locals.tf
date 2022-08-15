locals {
    network_id = var.network_params.network_id
    project = var.network_params.project
    postfix = var.network_params.postfix
    zone = var.zone

    shortname = "api3tracker"
    hostname = "${local.shortname}-${local.postfix}"
    entrypoint = var.zone.entrypoint
    route = local.shortname
    service_port = 3000
    host = var.zone.https == 1 ? var.zone.host : "localhost"
    scheme = var.zone.https == 1 ? "https" : "http"
    middlewares = var.restricted == 1 ? "compress,trusted" : "compress"
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
            value = "Host(`${local.host}`)"
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

    labels = concat(
        var.network_params.labels,
        var.zone.labels,
        local.labels_entrypoint,
        local.labels_service,
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
        "DATABASE_URL=${var.connection}",
    ]

    upload = length(var.webconfig) > 0 ? [ {
       file = "/app/webconfig.yaml",
       content = var.webconfig
    } ] : []
}
