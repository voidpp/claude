from invoke import task


@task()
def query_type_definitions(c):
    """Generate typescript definitions files for the inline graphql queries"""
    c.run("npx graphql-codegen")


@task()
def build(c):
    """Build the frontend"""
    c.run("npm run build")


@task()
def start(c):
    """Run the frontend in development mode"""
    c.run("npm run dev")
