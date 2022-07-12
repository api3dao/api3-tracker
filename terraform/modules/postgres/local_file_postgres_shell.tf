resource "local_file" "shell" {
   content = <<EOF
#!/usr/bin/env bash
set -x
export PID=$(docker ps --filter "label=host=${local.host}" --format "{{.ID}}")
if [[ "$PID" != "" ]]; then
   docker exec -it $PID bash -c 'psql -U $POSTGRES_USER -h 127.0.0.1 -d $POSTGRES_DB'
else 
   echo "ERROR: postgres docker process was not found"
   exit 1
fi
EOF
   filename = "./bin/postgres-shell.sh"
   file_permission = "0777"
}

