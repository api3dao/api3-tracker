resource "local_file" "query_instant" {
   content = <<EOF
#!/usr/bin/env bash
set -e
docker exec -it prometheus-${local.postfix} promtool query instant http://${local.hostname}:9090/prometheus $@  
EOF
   filename = "./bin/prometheus-query-instant.sh"
   file_permission = "0777"
}
