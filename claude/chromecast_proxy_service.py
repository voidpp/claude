import json
import logging
from aiohttp.web import Request, WebSocketResponse
from aiohttp import WSMsgType
from pychromecast import get_chromecasts
import asyncio
import datetime

logger = logging.getLogger(__name__)

def default(o):
    if isinstance(o, (datetime.date, datetime.datetime)):
        return o.isoformat()


class ChromecastListener:
    def __init__(self, ws: WebSocketResponse):
        self.ws = ws
        self._status = {'cast': None, 'media': None}

    def send_json(self):
        loop = asyncio.new_event_loop()
        task = loop.create_task(self.ws.send_str(json.dumps(self._status, default = default)))
        loop.run_until_complete(task)

    def new_cast_status(self, status):
        self._status['cast'] = status._asdict()
        self.send_json()

    def new_media_status(self, status):
        self._status['media'] = status.__dict__
        self.send_json()

async def chromecast_proxy_service(request: Request):

    ws = WebSocketResponse()

    await ws.prepare(request)

    friendly_name = request.match_info.get('friendly_name')

    logger.info("Client connected to chromecast proxy to %s", friendly_name)

    chromecast = next(cc for cc in get_chromecasts() if cc.device.friendly_name == friendly_name)

    chromecast.start()

    cc_listener = ChromecastListener(ws)
    chromecast.register_status_listener(cc_listener)
    chromecast.media_controller.register_status_listener(cc_listener)

    async for msg in ws:
        if msg.type == WSMsgType.TEXT:
            if msg.data == 'close':
                await ws.close()

        elif msg.type == WSMsgType.ERROR:
            logger.error("ws connection closed with exception %s", ws.exception())

    logger.info("Chromecast proxy websocket connection closed")

    return ws
