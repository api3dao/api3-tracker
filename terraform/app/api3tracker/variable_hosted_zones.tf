variable hosted_zones {
    type = map(object({
        name = string
        host = string
        local_port = number
    }))
}

