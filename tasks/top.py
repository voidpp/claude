from invoke import task

from tasks.tools import generate_graphql_schema


@task
def build(c):
    """Create an installable pip package"""
    generate_graphql_schema()
    c.run("npx graphql-codegen")
    c.run("npx webpack --mode=production")
    c.run("poetry build")


@task
def generate_next_version(c):
    """Generate next version string based on git tags and commits"""
    from git import Repo
    from semver import VersionInfo

    repo = Repo(".")

    max_tag_version = max([tag for tag in repo.tags], key=lambda t: VersionInfo.parse(t.name))

    prefixes = []

    for commit in repo.iter_commits("master"):
        prefixes.append(commit.message.split(":")[0])
        if max_tag_version.commit == commit:
            break

    last_version: VersionInfo = VersionInfo.parse(max_tag_version.name)

    if "enh" in prefixes:
        next_version = last_version.bump_minor()
    elif "fix" in prefixes:
        next_version = last_version.bump_patch()
    else:
        raise Exception("Only minor and patch bump is implemented right now!")

    print(next_version)
