import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

export default withMermaid(
  defineConfig({
    title: "PortRegistry",
    description: "Modern port monitoring and process control",
    base: 'https://github.com/haroonabbasi/port-registry',
    themeConfig: {
      logo: '../../assets/icon.png',
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
