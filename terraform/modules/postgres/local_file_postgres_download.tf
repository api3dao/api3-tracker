resource "local_file" "download" {
   count = local.aws_backup_bucket == "" ? 0 : 1
   content = <<EOF
#!/usr/bin/env bash
set -ex

export DIR="$( cd "$( dirname "$${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
export DIR_EXCHANGE=${local.volume_exchange}
mkdir -p $DIR_EXCHANGE

export PID=$(docker ps --filter "label=host=${local.host}" --format "{{.ID}}")
if [[ "$PID" != "" ]]; then
    export LAST_SQL_GZ=$(aws s3 ls --profile ${local.aws_profile} s3://${local.aws_backup_bucket}/${local.aws_backup_path}/ | \
        tail -n1 | rev | cut -d' ' -f1 | rev | tr -d \'[:space:]\')
    export LAST_SQL=$(echo $LAST_SQL_GZ | sed -r 's/\.gz$//')
    export FULL_S3_PATH=s3://${local.aws_backup_bucket}/${local.aws_backup_path}/$LAST_SQL_GZ
    echo "Latest backup is available at $FULL_S3_PATH"
    cd $DIR_EXCHANGE

    if [ -f "$DIR_EXCHANGE/$LAST_SQL" ]; then
        echo "Already downloaded to $DIR_EXCHANGE/$LAST_SQL"
    elif [ -f "$DIR_EXCHANGE/$LAST_SQL_GZ" ]; then
        echo "Already downloaded to $DIR_EXCHANGE/$LAST_SQL_GZ"
        gunzip -k $LAST_SQL_GZ
    else
        aws s3 cp --profile ${local.aws_profile} $FULL_S3_PATH $DIR_EXCHANGE/$LAST_SQL_GZ
        gunzip -k $LAST_SQL_GZ
    fi

    cat $LAST_SQL | docker exec -i $PID psql -U ${local.root_user} -d ${local.database} -h 127.0.0.1
    rm -f $LAST_SQL

   echo "Postgres dump installed successfully"
else
   echo "ERROR: postgres docker process was not found"
   exit 1
fi
EOF
   filename = "./bin/postgres-download.sh"
   file_permission = "0777"
}

