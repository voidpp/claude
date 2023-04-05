import logging
from time import time

from redis import asyncio as aioredis
from starlette.applications import Starlette
from starlette.middleware import Middleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from starlette.routing import Mount, Route
from starlette.staticfiles import StaticFiles
from starlette_graphene3 import GraphQLApp, make_graphiql_handler

from claude.api.schema import create_api_schema
from claude.components.config import Config, load_config
from claude.components.folders import Folders
from claude.components.injection_middleware import InjectionMiddleware
from claude.components.logging import init_logger
from claude.components.plugins import PluginManager
from claude.components.request_context import RequestContext
from claude.components.settings.manager import SettingsManager
from claude.components.types import RequestScopeKeys
from claude.endpoints import index
from claude.env import environment

logger = logging.getLogger(__name__)


class LoggedGraphQLApp(GraphQLApp):
    async def _handle_http_request(self, request: Request) -> JSONResponse:
        start = time()
        result = await super()._handle_http_request(request)
        end = time()
        milliseconds = (end - start) * 1000
        logger.debug("Query time: %s ms", round(milliseconds, 2))
        return result


def get_app(config: Config = None):
    env = environment()

    debug = env.dev_mode

    if config is None:
        config = load_config()

    init_logger(debug)

    logger.info("Environment variables: %s", env.dict())
    logger.info("Config data: %s", config.dict())

    redis_client = aioredis.from_url(config.redis)
    settings_manager = SettingsManager(redis_client)
    plugin_manager = PluginManager(config)

    request_context = RequestContext(redis_client, config, settings_manager, plugin_manager)

    app = Starlette(
        debug,
        routes=[
            Mount("/static", app=StaticFiles(directory=Folders.static), name="static"),
            Mount("/api", LoggedGraphQLApp(create_api_schema(), on_get=make_graphiql_handler())),
            Route("/{path:path}", index),
        ],
        middleware=[
            Middleware(InjectionMiddleware, data={RequestScopeKeys.CONTEXT: request_context}),
        ],
    )

    return app
