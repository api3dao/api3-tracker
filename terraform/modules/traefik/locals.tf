locals {
  project = var.network_params.project
  postfix = var.network_params.postfix
  network_internal_id = var.network_params.network_id

  shortname = "api"
  hostname = "traefik-${local.postfix}"

  default_host_rule = var.hosted_zones["default"].host_rule
  default_www_rule = var.hosted_zones["default"].www_rule
  default_entrypoint = var.hosted_zones["default"].name

  www = "www"

  jaeger_endpoint = var.https == 1 ? "${var.jaeger_endpoint}" : ""
  jaeger_enabled = var.https == 1 ? "true" : "false"
}

locals {
  ports_localhost = [
    for z in var.hosted_zones : {
      internal = z.local_port
      external = z.local_port
    }
  ]
  ports_multihost = [{
    internal = 80
    external = 80
  },{
    internal = 443
    external = 443
  }]
  ports = var.https == 1 ? local.ports_multihost: local.ports_localhost

  cert_config = join("\n", concat([
    for cert in var.certificates:  join("\n",[
"   - certFile: /certs/${cert.name}.crt",
"     keyFile: /certs/${cert.name}.key"
])
  ]))

  upload = concat(var.upload, [
    for cert in var.certificates: {
       "file": "/certs/${cert.name}.crt",
       "content": cert.certificate,
    }
  ], [
    for cert in var.certificates: {
       "file": "/certs/${cert.name}.key",
       "content": cert.private_key,
    }
  ], [
    {
      file = "/certs/certs-traefik.yml",
      content = join("\n", [
"tls:",
"  certificates:", local.cert_config,
])
    }
  ])
}

locals {
  // Labels that are used as contraints for Ingress configuration
  labels_constraints  = [
    {
      label = "traefik.enable"
      value = "true"
    }, {
      label = "traefik.docker.network"
      value = docker_network.public.name
    }, {
      label = "traefik.constraint-label"
      value = docker_network.public.name
    }
  ]
}

locals {
  // Zone is used on output to embed ingress properties after traefik is running
  zone = {
    for name, z in var.hosted_zones : name => {
      "network_internal_id" = local.network_internal_id
      "network_public_id" = docker_network.public.id
      "network_public_name" = docker_network.public.name
      "postfix" = local.postfix
      "project" = local.project
      "name" = z.name
      "hosts" = var.https == 1 ? z.hosts : ["localhost"]
      "host_rule" = var.https == 1 ? z.host_rule : "Host(`localhost`)"
      "www_rule" = var.https == 1 ? z.www_rule : ""
      "entrypoint" = var.https == 1 ? "https" : z.name
      "local_port" = z.local_port
      "https" = var.https
      "labels" = local.labels_constraints
    }
  }
}

locals {
  labels_all_zones = [
    {
      label = "traefik.enable"
      value = "true"
    }, {
      label = "traefik.docker.network"
      value = docker_network.public.name
    }, {
      label = "traefik.constraint-label"
      value = docker_network.public.name
    }
  ]
}


locals {
  labels_container = concat(
    var.network_params.labels,
    local.labels_constraints,
    local.labels_middleware_trusted,
    local.labels_middleware_compress,
    local.labels_route_dashboard,
    local.default_www_rule != "" ? local.labels_route_www : [],
    var.geoip_url == "" ? [] : local.labels_middleware_geo,
  )
  entrypoints_localhost = flatten([
    for name, z in var.hosted_zones : [
      "--entrypoints.${z.name}.address=:${z.local_port}",
    ]
  ])
  entrypoints_multihost = [
    "--entrypoints.http.address=:80",
    "--entrypoints.https.address=:443",
    "--entrypoints.http.http.redirections.entrypoint.to=https",
    "--entrypoints.http.http.redirections.entrypoint.scheme=https",
    "--entrypoints.http.http.redirections.entrypoint.permanent=true",
  ]
  entrypoints = var.https == 1 ? local.entrypoints_multihost: local.entrypoints_localhost

  tracing = [
    "--tracing=${local.jaeger_enabled}",
    "--tracing.jaeger.collector.endpoint=${local.jaeger_endpoint}",
    // "--tracing.jaeger.samplingServerURL=http://localhost:5778/sampling",
    // "--tracing.jaeger.samplingType=const",
    // "--tracing.jaeger.samplingParam=1.0"
    // "--tracing.jaeger.localAgentHostPort=127.0.0.1:6831",
    // "--tracing.jaeger.propagation=jaeger"
    // "--tracing.jaeger.traceContextHeaderName=uber-trace-id",
    // "--tracing.jaeger.collector.user=my-user",
    // "--tracing.jaeger.collector.password=my-password",
  ]
}

locals {
  env = [
    "LOGSPOUT=ignore",
  ]

  command = compact(concat(
    local.entrypoints,
    local.tracing,
    var.https == 1 ? [
      "--certificatesresolvers.le.acme.email=${var.admin_email}",
      "--certificatesresolvers.le.acme.storage=/certificates/acme.json",
      "--certificatesresolvers.le.acme.tlschallenge=true",
      "--log.level=DEBUG",
    ] : [
      "--api.insecure=true",
      "--log.level=DEBUG",
    ],
    length(var.certificates) > 0 ? [
      "--providers.file.directory=/certs/",
      "--providers.file.watch=true"
    ] : [],
    [
      "--providers.docker",
      "--providers.docker.constraints=Label(`traefik.constraint-label`, `${docker_network.public.name}`)",
      "--providers.docker.exposedbydefault=false",
      "--accesslog=true",
      "--accesslog.bufferingsize=10",
      "--api=true",
      "--api.debug=true",
      "--api.dashboard=true",
      "--log",
      "--log.format=json",
    ])
  )
}
