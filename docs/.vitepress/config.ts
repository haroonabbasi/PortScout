import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

// Allow overriding the base path via environment variable `DOCS_BASE`.
// Defaults: development -> '/', production -> '/port-registry/' (project-root relative).
const computedBase = process.env.DOCS_BASE ?? (process.env.NODE_ENV === 'development' ? '/' : '/port-registry/')
export default withMermaid(
  defineConfig({
    title: "PortRegistry",
    description: "Modern port monitoring and process control",
    // For GitHub Pages project site, base should be the repo name path.
    // This makes built asset URLs like `/port-registry/assets/...` which GitHub Pages serves.
    base: computedBase,
    themeConfig: {
      // Use a path that will be prefixed by `base` during build.
        // Use a path that will be prefixed by `base` during build.
        // Add a version query param to bust caches when we update the logo.
        logo: '/assets/icon.png?v=2',
      nav: [
        { text: 'Home', link: '/' },
        { text: 'Architecture', link: '/architecture' },
        {
          text: 'Reference', items: [
            { text: 'Frontend', link: '/front-end' },
            { text: 'Backend', link: '/back-end' },
            { text: 'Installer', link: '/installer' }
          ]
        }
      ],
      sidebar: [
        {
          text: 'Guide',
          items: [
            { text: 'Architecture', link: '/architecture' },
            { text: 'Frontend Development', link: '/front-end' },
            { text: 'Backend Development', link: '/back-end' }
          ]
        },
        {
          text: 'Deployment',
          items: [
            { text: 'Installer Guide', link: '/installer' },
            { text: 'Release Process', link: '/release' },
            { text: 'Automation & CI', link: '/automation' }
          ]
        },
        {
          text: 'Reflections',
          items: [
            { text: 'Lessons Learned', link: '/lessons-learned' }
          ]
        }
      ],
      socialLinks: [
        { icon: 'github', link: 'https://github.com/haroonabbasi/port-registry' }
      ],
      footer: {
        message: 'Released under the MIT License.',
        copyright: 'Copyright © 2024-present PortRegistry'
      },
      search: {
        provider: 'local'
      }
    },
    mermaid: {
      // Mermaid config options
    },
    mermaidPlugin: {
      class: "mermaid"
    }
  })
)
function assetPath(p: string) {
  // Ensure single-slash joining
  return `${computedBase.replace(/\/$/, '')}/${p.replace(/^\/+/, '')}`
}
