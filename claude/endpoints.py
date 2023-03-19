from time import time

import pkg_resources
from starlette.applications import Starlette
from starlette.requests import Request
from starlette.templating import Jinja2Templates

from claude.components.tools import app_version

from .components.folders import Folders

templates = Jinja2Templates(Folders.templates)


async def index(request: Request):
    app: Starlette = request.app

    return templates.TemplateResponse(
        name="index.html",
        context={
            "request": request,
            "version": app_version(app.debug),
            "dev_mode": app.debug,
        },
    )
