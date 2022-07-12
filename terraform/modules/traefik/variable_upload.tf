variable "upload" {
    type = list(object({
        file = string
        content = string
    }))
    description = "additional files to be uploaded to traefik containers"
    default = []
}
