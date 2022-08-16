const webpack = require("webpack");
const path = require("path");
const toPath = (_path) => path.join(process.cwd(), _path);

module.exports = {
  stories: [
    "../stories/**/*.stories.mdx",
    "../stories/**/*.stories.@(js|jsx|ts|tsx)",
  ],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "storybook-addon-next",
  ],
  babel: async (options) => ({
    // Update your babel configuration here
    ...options,
  }),
  features: {
    postcss: true,
  },
  framework: "@storybook/react",
  core: {
    builder: "@storybook/builder-webpack5",
  },
  webpackFinal: (config) => {
    /**
     * Add support for alias-imports
     * @see https://github.com/storybookjs/storybook/issues/11989#issuecomment-715524391
     */
    config.resolve.alias = {
      ...config.resolve?.alias,
      "@": [path.resolve(__dirname, "../src/"), path.resolve(__dirname, "../")],
    };

    /**
     * Fixes font import with /
     * @see https://github.com/storybookjs/storybook/issues/12844#issuecomment-867544160
     */
    config.resolve.roots = [
      path.resolve(__dirname, "../public"),
      "node_modules",
    ];
    config.resolve.extensions = [".ts", ".tsx", ".js", ".jsx"];
    config.resolve.fallback = {
      // stream: require.resolve("stream-browserify"),
      buffer: require.resolve("buffer/"),
    };
    config.plugins = [
      ...config.plugins,
      // Work around for Buffer is undefined:
      // https://github.com/webpack/changelog-v5/issues/10
      new webpack.ProvidePlugin({
        Buffer: ["buffer", "Buffer"],
      }),
      //new webpack.ProvidePlugin({
       // process: "process/browser",
      // }),
    ];

    return config;
  },
};
