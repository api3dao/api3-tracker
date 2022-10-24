variable zone {
    type = object({
        hosts = list(string)
        host_rule = string
        https = number
        labels = list(object({
            label = string
            value = string
        }))
        local_port = number
        name = string
        network_internal_id = string
        network_public_id = string
        network_public_name = string
        postfix = string
        project = string
        entrypoint = string
    })
}
