import { RouterContext } from "next/dist/shared/lib/router-context"; // next 12
import { withNextRouter } from 'storybook-addon-next-router';

export const decorators = [
  withNextRouter
];

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  nextRouter: {
    Provider: RouterContext.Provider,
  },
}
