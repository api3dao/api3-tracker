resource "random_string" "root_password" {
  length  = 16
  upper   = false
  special = false
}

