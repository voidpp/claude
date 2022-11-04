import logging
from time import time

import aioredis
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
from claude.components.request_context import RequestContext
from claude.components.settings.manager import SettingsManager
from claude.components.types import Environment, RequestScopeKeys
from claude.endpoints import index

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
    debug = Environment.DEV_MODE.get()

    if config is None:
        config = load_config()

    init_logger(debug)

    logger.info("Environment variables: %s", {key.value: key.get() for key in Environment})

    redis_client = aioredis.from_url(config.redis)
    settings_manager = SettingsManager(redis_client)

    request_context = RequestContext(redis_client, config, settings_manager)

    app = Starlette(
        debug,
        routes=[
            Mount("/static", app=StaticFiles(directory=Folders.static), name="static"),
            Mount("/api", LoggedGraphQLApp(create_api_schema(), on_get=make_graphiql_handler())),
            Route("/", index),
        ],
        middleware=[
            Middleware(InjectionMiddleware, data={RequestScopeKeys.CONTEXT: request_context}),
        ],
    )

    return app
