locals {
    network_id = var.network_params.network_id
    project = var.network_params.project
    postfix = var.network_params.postfix

    // external settings
    shortname = "grafana"
    hostname = "${local.shortname}-${local.postfix}"
    entrypoint = var.zone.entrypoint
    route = local.shortname
    service_port = 3000
    middleware_rewrite = "${local.shortname}-rewrite"
    middlewares = ""
    // scheme = var.zone.https == 1 ? "https": "http"
    host_rule = var.zone.host_rule
    path = "/grafana/"
    subpath = "true"

    webroot = "/grafana"
    plugins = "grafana-clock-panel,briangann-gauge-panel,natel-plotly-panel,grafana-simple-json-datasource"
    admin_password = var.admin_password
}

locals {
    env = [
        // "GF_INSTANCE_NAME=${local.host}",
        "GF_DEFAULT_THEME=light",
        "GF_SECURITY_ADMIN_PASSWORD=${local.admin_password}",
        "GF_USERS_ALLOW_SIGN_UP=false",
        "GF_DISABLE_GRAVATAR=true",
        "GF_ALLOW_ORG_CREATE=false",
        "GF_INSTALL_PLUGINS=${local.plugins}",
        "GF_SERVER_ROOT_URL=${local.webroot}",
        "GF_SERVER_SERVE_FROM_SUB_PATH=${local.subpath}",
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
