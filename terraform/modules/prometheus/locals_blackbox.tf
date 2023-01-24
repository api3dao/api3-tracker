locals {
  blackbox_config  = <<-EOT
modules:
  http_2xx:
    http:
      fail_if_not_ssl: false
      preferred_ip_protocol: ip4
    prober: http
    timeout: 5s
  https_2xx:
    http:
      fail_if_not_ssl: true
      preferred_ip_protocol: ip4
    prober: http
    timeout: 10s
EOT

}
