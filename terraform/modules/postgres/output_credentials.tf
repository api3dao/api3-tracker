output "credentials" {
  value = ({
      host = local.host
      port = local.port
      database = local.database
      user = local.root_user
      password = local.root_password
  })
  sensitive = true
}

