variable "endpoints" {
  type = object({
    default = string
    archive = string
  })
  description = "Ethereum HTTP Endpoints for JSON+RPC"
}

