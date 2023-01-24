locals {
  // WARNING: please don't use underscords in JOB names
  // it breaks markdown in telegram notifications

  blackbox_http_jobs = length(var.http_probes) == 0 ? [] : concat([
  "  - job_name: 'blackbox_http'",
  "    metrics_path: /probe",
  "    params:",
  "      module: [http_2xx]",
  "    static_configs:",
  "     - targets:"
], [for url in var.http_probes: join("\n", [
  "        - ${url}",
])], [
  "    relabel_configs:",
  "     - source_labels: [__address__]",
  "       target_label: __param_target",
  "     - source_labels: [__param_target]",
  "       target_label: instance",
  "     - target_label: __address__",
  "       replacement: prometheus-blackbox-${local.postfix}:9115",
])

  blackbox_https_jobs = length(var.https_probes) == 0 ? [] : concat([
  "  - job_name: 'blackbox_https'",
  "    metrics_path: /probe",
  "    params:",
  "      module: [https_2xx]",
  "    static_configs:",
  "     - targets:"
], [for url in var.https_probes: join("\n", [
  "        - ${url}",
])], [
  "    relabel_configs:",
  "     - source_labels: [__address__]",
  "       target_label: __param_target",
  "     - source_labels: [__param_target]",
  "       target_label: instance",
  "     - target_label: __address__",
  "       replacement: prometheus-blackbox-${local.postfix}:9115",
])

  config  = <<-EOT
global:
  scrape_interval: 1m
  evaluation_interval: 1m
  scrape_timeout: 10s

rule_files:
  - "/etc/prometheus/node_exporter.rules.yml"
  - "/etc/prometheus/postgres.rules.yml"
  - "/etc/prometheus/blackbox.rules.yml"
  - "/etc/prometheus/api3tracker.rules.yml"

scrape_configs:
${join("\n",local.blackbox_http_jobs)}

${join("\n",local.blackbox_https_jobs)}

${join("\n",var.jobs)}
EOT

}
