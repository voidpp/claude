from invoke import task


@task()
def query_type_definitions(c):
    """generate typescript definitions files for the inline graphql queries"""
    c.run("npx graphql-codegen")


@task()
def compile(c, watch=False):
    commands = ["npx", "webpack"]
    if watch:
        commands.append("-w")
    c.run(" ".join(commands))
