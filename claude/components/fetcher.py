from io import StringIO
import logging
from httpx import AsyncClient
from lxml import etree
from xml.etree.ElementTree import ElementTree

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
