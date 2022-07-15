export interface IWebPage {
  slug: string
  title?: string
  description?: string
  ogTitle?: string
  ogDescription?: string
}

export interface IWebConfig {
  github?: string
  ethscan?: string
  pages: Map<string, IWebPage>
}

