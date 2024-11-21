resource "local_file" "cli" {
   content = <<EOF
#!/usr/bin/env bash
set -x
docker exec -e TS_NODE_PROJECT=./tsconfig.cli.json \
   -i ${local.hostname} yarn ts-node -T cli.ts $@
EOF

   filename = "./bin/cli.sh"
   file_permission = "0777"
}

