from invoke import task

from tasks.tools import generate_graphql_schema


@task
def build(c):
    """Create an installable pip package"""
    generate_graphql_schema()
    c.run("npx graphql-codegen")
    c.run("npx webpack --mode=production")
    c.run("poetry build")
