resource "random_string" "password" {
  length  = 16
  upper   = false
  special = false
}

