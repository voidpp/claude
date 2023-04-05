import os

from invoke import task

from claude.env import env_key

from .tools import Collection


@task
def start(c, port=9042, reload=True, workers=None, debug=True):
    """Start the API server"""
    from pathlib import Path

    from claude.env import environment

    env = environment()

    cmd_parts = [
        "uvicorn",
        "claude.app:get_app",
        "--factory",
        "--host 0.0.0.0",
        f"--port {port}",
    ]

    if reload:
        cmd_parts.append("--reload")
        if config_file := env.config_file:
            rel_path = Path(config_file).relative_to(Path(__file__).parent.parent)
            cmd_parts += ["--reload-include", str(rel_path)]
    elif workers:
        cmd_parts.append(f"--workers {workers}")

    if debug:
        os.environ[env_key("dev_mode")] = "1"

    c.run(" ".join(cmd_parts))


@task
def test(c, watch=False):
    """Run the tests"""
    c.run("ptw" if watch else "pytest")


@task
def format(c):
    """Format the backend code"""
    c.run("pre-commit run --all-files --verbose")


@task
def generate_graphql_schema(c):
    """Generate the API GraphQL schame file"""
    from .tools import generate_graphql_schema

    generate_graphql_schema()


redis = Collection("redis")


def get_redis_client():
    from claude.components.config import load_config

    config = load_config()
    from redis import asyncio as aioredis

    return aioredis.from_url(config.redis)


@redis.task()
def list(c, filter="*"):
    """List redis keys"""
    import asyncio

    from tabulate import tabulate

    redis_client = get_redis_client()

    rows = []

    async def execute():
        keys = await redis_client.keys(filter)
        if not keys:
            print("no results found")
            return
        data = await redis_client.mget(*keys)
        for [key, value] in zip(keys, data):
            rows.append([key.decode(), len(value)])
        print(tabulate(rows, headers=["key", "value length"], tablefmt="psql"))

    asyncio.run(execute())


@redis.task()
def delete(c, key):
    """Delete a redis value by a key name"""
    import asyncio

    redis_client = get_redis_client()

    async def execute():
        res = await redis_client.delete(key.encode())
        if res:
            print(f"'{key}' is deleted")
        else:
            print(f"'{key}' not found")

    asyncio.run(execute())


@redis.task()
def show(c, key):
    """View redis value by a key name"""
    import asyncio
    import json

    redis_client = get_redis_client()

    async def execute():
        data = await redis_client.get(key)
        print(json.dumps(json.loads(data), indent=2))

    asyncio.run(execute())
