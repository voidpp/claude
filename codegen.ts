import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
    schema: 'frontend/schema.graphql',
    documents: ['frontend/**/*.tsx'],
    generates: {
        'frontend/types-and-hooks.tsx': {
            plugins: ['typescript', 'typescript-operations', 'typescript-react-apollo']
        },
    },
}
export default config
