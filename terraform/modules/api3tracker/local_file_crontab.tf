resource "local_file" "crontab_api3tracker" {
  content = <<EOF
*/10 * * * * root cd ${path.cwd} && ./bin/cli.sh logs download 2>&1 >> /var/logs/api3-logs-download.log
15,45 * * * * root cd ${path.cwd} && ./bin/cli.sh supply download >> /var/logs/api3-supply-download.log
0 * * * * root cd ${path.cwd} && ./bin/cli.sh treasuries download >> /var/logs/api3-treasuries-download.log
10 * * * * root cd ${path.cwd} && ./bin/cli.sh state update >> /var/logs/api3-state-update.log
EOF

  filename = "./cron.d/crontab_api3tracker"
  file_permission = "0777"
 }


