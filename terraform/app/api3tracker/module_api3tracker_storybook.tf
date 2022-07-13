module "api3tracker_storybook" {
  source = "../../modules/api3tracker-storybook"

  network_params = module.network.params
  registry = var.registry
  zone = module.traefik.zone["default"]

  enable = var.enable_storybook
}
