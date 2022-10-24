resource "local_file" "backup" {
   count = local.aws_backup_bucket == "" ? 0 : 1
   content = <<EOF
#!/usr/bin/env bash
set -ex

now() {
    date +"%Y%m%dT%H%M%S"
}

export DIR="$( cd "$( dirname "$${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
export DIR_EXCHANGE=${local.volume_exchange}
mkdir -p $DIR_EXCHANGE

export PID=$(docker ps --filter "label=host=${local.host}" --format "{{.ID}}")
if [[ "$PID" != "" ]]; then

    export LAST_SQL=${local.project}-${local.database}-`now`.sql
    export LAST_SQL_GZ=$LAST_SQL.gz
    echo "Starting Postgres backup $LAST_SQL_GZ"
    docker exec -i $PID pg_dump --no-owner --clean -U ${local.root_user} -h 127.0.0.1 ${local.database} | gzip > $DIR_EXCHANGE/$LAST_SQL_GZ

    export FULL_S3_PATH=s3://${local.aws_backup_bucket}/${local.aws_backup_path}/$LAST_SQL_GZ
    aws s3 cp --profile ${local.aws_profile} \
        $DIR_EXCHANGE/$LAST_SQL_GZ \
        $FULL_S3_PATH
    rm -f $DIR_EXCHANGE/$LAST_SQL_GZ
    echo "Latest backup is uploaded to $FULL_S3_PATH"

else
   echo "ERROR: postgres docker process was not found"
   exit 1
fi
EOF
   filename = "./bin/postgres-backup.sh"
   file_permission = "0777"
}

