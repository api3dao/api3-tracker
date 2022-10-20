resource "local_file" "cli" {
   content = <<EOF
#!/usr/bin/env bash
set -x
docker exec -e TS_NODE_PROJECT=./tsconfig.cli.json \
   -it ${local.hostname} yarn ts-node cli.ts $@
EOF

   filename = "./bin/cli.sh"
   file_permission = "0777"
}

