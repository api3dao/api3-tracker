variable network_params {
    type = object({
        network_id = string
        postfix = string
        project = string
        env = string
        workspace = string
        log_opts = map(any)
        labels = list(object({
            label = string
            value = string
        }))
    })
}
