resource "local_file" "targets" {
   content = <<EOF
#!/usr/bin/env bash
set -e
docker exec -it prometheus-${local.postfix} curl -s http://${local.hostname}:9090/prometheus/api/v1/targets  | jq -r '.data.activeTargets[] | [if .health == "up" then "+" else if .health == "down" then "-" else "." end end, .labels.job ] | @tsv' | sort

EOF
   filename = "./bin/prometheus-targets.sh"
   file_permission = "0777"
}
