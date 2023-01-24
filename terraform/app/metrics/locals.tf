locals {
  api3_tracker_host = var.api3tracker_host

  http_probes = []
  https_probes = [ "https://${local.api3_tracker_host}" ]

  prometheus_jobs = [
  "  - job_name: \"api3tracker\"",
  "    scheme: 'https'",
  "    metrics_path: '/api/metrics'",
  "    static_configs:",
  "      - targets: [\"${local.api3_tracker_host}\"]",
  "",
  "  - job_name: \"dockerstats-api3tracker\"",
  "    scheme: 'https'",
  "    metrics_path: '/stats/dockerstats/metrics'",
  "    static_configs:",
  "      - targets: [\"${local.api3_tracker_host}\"]",
  "",

  "  - job_name: \"nodeexporter-api3tracker\"",
  "    scheme: 'https'",
  "    metrics_path: '/stats/nodeexporter/metrics'",
  "    static_configs:",
  "      - targets: [\"${local.api3_tracker_host}\"]",
  "",

  "  - job_name: \"postgres-api3tracker\"",
  "    scheme: 'https'",
  "    metrics_path: '/stats/postgres/metrics'",
  "    static_configs:",
  "      - targets: [\"${local.api3_tracker_host}\"]",
  "",
  ]

  // TODO: prometheus rules should be here
}

