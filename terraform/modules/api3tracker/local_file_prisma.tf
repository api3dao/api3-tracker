resource "local_file" "prisma" {
   content = <<EOF
#!/usr/bin/env bash
set -x
docker exec -it ${local.hostname} yarn prisma $@
EOF

   filename = "./bin/prisma.sh"
   file_permission = "0777"
}

