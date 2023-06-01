variable "coingecko" {
  type = object({
    host = string
    api_key = string
  })
  default = {
    host = "api.coingecko.com"
    api_key = ""
  }
  description = "Host and API Key for CoinGecko-compatible API to get historical prices"
}
