locals {
  network_id = var.network_params.network_id
  project = var.network_params.project
  postfix = var.network_params.postfix

  shortname = "tgalerts"
  hostname = "${local.shortname}-${local.postfix}"
  bot_token = var.telegram.bot_token
  chat_id = var.telegram.chat_id
}

locals {
  env = [
    "PROMETHEUS_ALERTS_URL=${var.alerts_url}",
    "TELEGRAM_BOT_TOKEN=${local.bot_token}",
    "TELEGRAM_CHAT_ID=${local.chat_id}",
  ]

  labels = [
  ]
}
