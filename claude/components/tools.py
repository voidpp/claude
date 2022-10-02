import logging
import re
from xml.etree.ElementTree import ElementTree
from lxml.cssselect import CSSSelector

from claude.components.exceptions import CannotParseNumber, SelectorNotFoundInTree


logger = logging.getLogger(__name__)

NUMBER_PATTERN = re.compile(r"([\d+\-]+)")


def parse_number(number: str) -> int | None:
    """
    >>> parse_number("-1")
    -1
    >>> parse_number("+42°F")
    42
    >>> parse_number(" -42 ° C ")
    -42
    >>> parse_number("ddsadas")
    None
    """

    logger.debug("parse number: '%s'", number)

    match = NUMBER_PATTERN.search(number)

    if match is None:
        raise CannotParseNumber(f"Cannot parse number: '{number}'")

    return int(match.group(1))


def tree_search_list(selector: str, tree: ElementTree) -> list:
    sel = CSSSelector(selector)
    res = sel(tree)
    if not len(res):
        raise SelectorNotFoundInTree(f"Selector '{selector}' not found.")
    return res


def tree_search(selector: str, tree: ElementTree):
    return tree_search_list(selector, tree)[0]
