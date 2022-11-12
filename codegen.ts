import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
    schema: 'frontend/schema.graphql',
    documents: ['frontend/**/queries.graphql'],
    generates: {
        'frontend/graphql-types-and-hooks.tsx': {
            plugins: ['typescript', 'typescript-operations', 'typescript-react-apollo']
        },
    },
}
export default config
