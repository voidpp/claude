import json
import logging
from io import StringIO
from xml.etree.ElementTree import ElementTree

from httpx import AsyncClient
from lxml import etree

logger = logging.getLogger(__name__)

html_parser = etree.HTMLParser()


class Fetcher:
    @classmethod
    async def fetch_url(cls, url: str) -> str:
        logger.debug("fetch url: %s", url)
        async with AsyncClient() as client:
            response = await client.get(url)
            return response.content.decode()

    @classmethod
    async def fetch_xml(cls, url: str) -> ElementTree:
        content = await cls.fetch_url(url)
        return etree.parse(StringIO(content), html_parser)

    @classmethod
    async def fetch_json(cls, url: str):
        content = await cls.fetch_url(url)
        return json.loads(content)
