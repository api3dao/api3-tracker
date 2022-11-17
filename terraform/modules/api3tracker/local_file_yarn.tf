resource "local_file" "yarn" {
   content = <<EOF
#!/usr/bin/env bash
set -x
docker exec -i ${local.hostname} yarn  $@
EOF

   filename = "./bin/yarn.sh"
   file_permission = "0777"
}

