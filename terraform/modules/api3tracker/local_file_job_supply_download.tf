resource "local_file" "job_supply_download" {
   content = <<EOF
#!/usr/bin/env bash
set -x
docker exec -e TS_NODE_PROJECT=./tsconfig.cli.json \
   -i ${local.hostname} yarn ts-node cli.ts supply download $@
EOF

   filename = "./bin/job_supply_download.sh"
   file_permission = "0777"
}

