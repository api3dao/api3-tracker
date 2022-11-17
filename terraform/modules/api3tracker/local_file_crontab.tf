resource "local_file" "crontab_api3tracker" {
  content = <<EOF
*/10 * * * * root cd ${path.cwd} && ./bin/cli.sh logs download >> /var/log/api3-logs-download.log 2>&1
15,45 * * * * root cd ${path.cwd} && ./bin/cli.sh supply download >> /var/log/api3-supply-download.log 2>&1
0 * * * * root cd ${path.cwd} && ./bin/cli.sh treasuries download >> /var/log/api3-treasuries-download.log 2>&1
*/10 * * * * root cd ${path.cwd} && ./bin/cli.sh state update >> /var/log/api3-state-update.log 2>&1
EOF

  filename = "./cron.d/crontab_api3tracker"
  file_permission = "0777"
 }


