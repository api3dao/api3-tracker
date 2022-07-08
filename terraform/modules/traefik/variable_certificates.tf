variable "certificates" {
    type = list(object({
        name = string
        certificate = string
        private_key = string
    }))
    default = []
}
