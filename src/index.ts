import type { ExternalOption, InputOptions, OutputOptions, Plugin } from 'rollup'

const ns = '@woocommerce/'
const nsExclude: string[] = []
const wcMatch = new RegExp(`^${ns}(?!(${nsExclude.join('|')})).*$`)

const wcExternal: Record<string, string> = {
    // wc-blocks packages
    '@woocommerce/blocks-checkout': 'wc.blocksCheckout',
    '@woocommerce/blocks-components': 'wc.blocksComponents',
    '@woocommerce/block-data': 'wc.wcBlocksData',
    '@woocommerce/blocks-registry': 'wc.wcBlocksRegistry',
    '@woocommerce/price-format': 'wc.priceFormat',
    '@woocommerce/settings': 'wc.wcSettings',
}

export const wcOptimizeDepsExclude = Object.keys(wcExternal)

export default function wcDependencyExtraction(isDev: boolean): Plugin {
    return {
        name: 'wc-dependency-extraction',
        options: (options: InputOptions) => {
            if (!Array.isArray(options.external)) {
                options.external = [options.external].filter(Boolean) as ExternalOption
            }

            if (Array.isArray(options.external)) {
                options.external = options.external.concat(Object.keys(wcExternal))
                options.external.push(wcMatch)
            }

            return options
        },
        outputOptions: (outputOptions: OutputOptions) => {
            const configGlobals = outputOptions.globals

            outputOptions.globals = (id: string) => {
                if (typeof configGlobals === 'object' && id in configGlobals && configGlobals[id]) {
                    return configGlobals[id]
                }

                if (typeof configGlobals === 'function') {
                    const configGlobalId = configGlobals(id)

                    if (configGlobalId && configGlobalId !== id) {
                        return configGlobalId
                    }
                }

                if (id in wcExternal && wcExternal[id]) {
                    return wcExternal[id]
                }

                if (wcMatch.test(id)) {
                    return id
                        .replace(new RegExp(`^${ns}`), 'wc.')
                        .replace(/\//g, '.')
                        .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
                }

                return ''
            }
        },
        transform(code: string, id: string) {
            if (isDev && (id.endsWith('.ts') || id.endsWith('.tsx'))) {
                Object.keys(wcExternal).forEach((key) => {
                    const value = wcExternal[key]
                    const regex = new RegExp(
                        `import\\s*{([^}]*)}\\s*from\\s*['"]${key}['"]`,
                        'g',
                    )
                    code = code.replace(
                        regex,
                        (_, imports) => `const {${imports.trim()}} = ${value};`,
                    )
                })
                return {
                    code,
                    map: null,
                }
            }
        },
    }
}