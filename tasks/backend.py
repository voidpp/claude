from invoke import task

from .tools import Collection


@task
def start(c, port=9042, reload=True, workers=None, debug=True):
    from pathlib import Path

    from claude.components.types import Environment

    cmd_parts = [
        "uvicorn",
        "claude.app:get_app",
        "--factory",
        "--host 0.0.0.0",
        f"--port {port}",
    ]

    if reload:
        cmd_parts.append("--reload")
        if config_file := Environment.CONFIG_FILE.get():
            rel_path = Path(config_file).relative_to(Path(__file__).parent.parent)
            cmd_parts += ["--reload-include", str(rel_path)]
    elif workers:
        cmd_parts.append(f"--workers {workers}")

    if debug:
        Environment.DEV_MODE.set("1")

    c.run(" ".join(cmd_parts))


@task
def test(c, watch=False):
    c.run("ptw" if watch else "pytest")


@task
def format(c):
    c.run("pre-commit run --all-files --verbose")


@task
def generate_graphql_schema(c):
    from .tools import generate_graphql_schema

    generate_graphql_schema()


redis = Collection("redis")


def get_redis_client():
    from claude.components.config import load_config

    config = load_config()
    import aioredis

    return aioredis.from_url(config.redis)


@redis.task()
def list(c, filter="*"):
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
    import asyncio
    import json

    redis_client = get_redis_client()

    async def execute():
        data = await redis_client.get(key)
        print(json.dumps(json.loads(data), indent=2))

    asyncio.run(execute())
