from invoke import task


@task()
def query_type_definitions(c):
    """Generate typescript definitions files for the inline graphql queries"""
    c.run("npx graphql-codegen")


@task()
def compile(c, watch=False):
    """Run webpack to create bundle.js"""
    commands = ["npx", "webpack"]
    if watch:
        commands.append("-w")
    c.run(" ".join(commands))
