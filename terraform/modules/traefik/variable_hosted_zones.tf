variable "hosted_zones" {
    type = map(object({
        name = string
        hosts = list(string)
        host_rule = string
        www_rule = string
        local_port = number
    }))
}
