resource "local_file" "crontab_postgres" {
  content = <<EOF
0 1 * * * root cd ${path.cwd} && bash ./bin/postgres-backup.sh >> /var/log/postgres-backups.log 2>&1
EOF

  filename = "./cron.d/crontab_postgres"
  file_permission = "0777"
 }

