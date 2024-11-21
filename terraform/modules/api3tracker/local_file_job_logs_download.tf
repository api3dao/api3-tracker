resource "local_file" "job_logs_download" {
   content = <<EOF
#!/usr/bin/env bash
set -x
docker exec -e TS_NODE_PROJECT=./tsconfig.cli.json \
   -i ${local.hostname} yarn ts-node -T cli.ts logs download $@
EOF

   filename = "./bin/job_logs_download.sh"
   file_permission = "0777"
}

