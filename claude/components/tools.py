from io import StringIO
import logging
import re
from xml.etree.ElementTree import ElementTree
from httpx import AsyncClient
from lxml import etree
from lxml.cssselect import CSSSelector

from claude.components.exceptions import CannotParseTemperature, SelectorNotFoundInTree


logger = logging.getLogger(__name__)

TEMP_PATTERN = re.compile(r"([\d+\-]+)")

html_parser = etree.HTMLParser()


def parse_temp(temp: str) -> int | None:
    """
    >>> parse_temp("-1")
    -1
    >>> parse_temp("+42°F")
    42
    >>> parse_temp(" -42 ° C ")
    -42
    >>> parse_temp("ddsadas")
    None
    """

    logger.debug("parse temp: '%s'", temp)

    match = TEMP_PATTERN.search(temp)

    if match is None:
        raise CannotParseTemperature(f"Cannot parse temp: '{temp}'")

    return int(match.group(1))


async def fetch_url(url: str) -> str:
    logger.debug("fetch url: %s", url)
    async with AsyncClient() as client:
        response = await client.get(url)
        return response.content.decode()


async def fetch_xml(url: str) -> ElementTree:
    content = await fetch_url(url)
    return etree.parse(StringIO(content), html_parser)


# TODO: remove return_first
def tree_search(selector: str, tree: ElementTree, *, return_first=True):
    sel = CSSSelector(selector)
    res = sel(tree)
    if not len(res):
        raise SelectorNotFoundInTree(f"Selector '{selector}' not found.")
    return res[0] if return_first else res
