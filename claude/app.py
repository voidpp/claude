import aioredis
from starlette.applications import Starlette
from starlette.middleware import Middleware
from starlette.routing import Mount, Route
from starlette.staticfiles import StaticFiles
from starlette.requests import Request


from claude.api.schema import create_api_schema
from starlette_graphene3 import GraphQLApp, make_graphiql_handler
from claude.components.folders import Folders

from claude.components.injection_middleware import InjectionMiddleware
from claude.components.types import RequestContext, RequestScopeKeys
from claude.components.config import Config, load_config


async def index(request: Request):
    return ""


def get_app(config: Config = None):

    if config is None:
        config = load_config()

    request_context = RequestContext(aioredis.from_url("redis://localhost/1"))

    app = Starlette(
        routes=[
            Mount("/static", app=StaticFiles(directory=Folders.static), name="static"),
            Mount("/api", GraphQLApp(create_api_schema(), on_get=make_graphiql_handler())),
            Route("/", index),
        ],
        middleware=[
            Middleware(InjectionMiddleware, data={RequestScopeKeys: request_context}),
        ],
    )

    return app
