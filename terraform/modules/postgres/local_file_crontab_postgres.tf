resource "local_file" "crontab_postgres" {
  content = <<EOF
24 4 * * */3 root cd ${path.cwd} && bash ./bin/postgres-backup.sh >> /var/log/postgres-backups.log 2>&1
EOF

  filename = "./cron.d/crontab_postgres"
  file_permission = "0777"
 }

