variable telegram {
  type = object({
    bot_token = string
    chat_id = string
  })
  default = {
    bot_token = ""
    chat_id = ""
  }
  description = "credentials for telegram alerts"
}
