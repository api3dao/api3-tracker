resource "local_file" "crontab_api3tracker" {
  content = <<EOF
*/10 * * * * root cd ${path.cwd} && ./bin/job_logs_download.sh >> /var/log/api3-logs-download.log 2>&1
15,45 * * * * root cd ${path.cwd} && ./bin/job_supply_download.sh >> /var/log/api3-supply-download.log 2>&1
0 * * * * root cd ${path.cwd} && ./bin/job_treasuries_download.sh >> /var/log/api3-treasuries-download.log 2>&1
*/15 * * * * root cd ${path.cwd} && ./bin/job_state_update.sh >> /var/log/api3-state-update.log 2>&1
5 0 * * * root cd ${path.cwd} && ./bin/job_shares_download.sh --tag . >> /var/log/api3-shares-download.log 2>&1
EOF

  filename = "./cron.d/crontab_api3tracker"
  file_permission = "0777"
 }


