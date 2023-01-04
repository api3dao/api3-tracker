resource "local_file" "job_state_update" {
   content = <<EOF
#!/usr/bin/env bash
set -x
docker exec -e TS_NODE_PROJECT=./tsconfig.cli.json \
   -e API3TRACKER_ENDPOINT=${var.endpoints.archive} \
   -i ${local.hostname} yarn ts-node cli.ts state update --rps-limit $@
EOF

   filename = "./bin/job_state_update.sh"
   file_permission = "0777"
}

