resource "local_file" "job_shares_download" {
   content = <<EOF
#!/usr/bin/env bash
set -x
docker exec -e TS_NODE_PROJECT=./tsconfig.cli.json \
   -e API3TRACKER_ENDPOINT=${var.endpoints.archive} \
   -i ${local.hostname} yarn ts-node cli.ts shares download --rps-limit $@
EOF

   filename = "./bin/job_shares_download.sh"
   file_permission = "0777"
}

