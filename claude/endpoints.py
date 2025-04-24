from starlette.requests import Request
from starlette.responses import FileResponse

from claude.components.folders import Folders


async def index(request: Request):
    return FileResponse(Folders.static / "index.html")
