module.exports = {
    base: '/attache/',
    title: 'Attaché',
    description: 'Highly opinionated deployment tool for Laravel applications',
    themeConfig: {
        nav: [
            { text: 'Home', link: '/' },
            { text: 'How it works', link: '/how/' },
            { text: 'Getting Started', link: '/started/' },
            { text: 'Config Reference', link: '/reference/' },
            { text: 'Release Management', link: '/releases/' }
        ],
        sidebar: {
            '/started/': [
                '',
            ],
            '/reference/': [
                '',
                'servers',
                'scripts'
            ],
            '/releases/': [
                '',
            ]
        },
        repo: 'tpg/attache'
    }
}