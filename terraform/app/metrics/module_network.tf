module "network" {
  source = "../../modules/network"

  postfix = random_string.postfix.result

  project = var.project
  workspace = var.workspace
  env = var.env
  log_opts = var.log_opts
}

