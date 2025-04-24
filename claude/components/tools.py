import asyncio
import logging
import re
from typing import Any, Awaitable
from xml.etree.ElementTree import Element, ElementTree

import pkg_resources
from graphene import ObjectType
from lxml.cssselect import CSSSelector
from pydantic import BaseModel

from claude.components.exceptions import CannotParseNumber, SelectorNotFoundInTree

logger = logging.getLogger(__name__)

NUMBER_PATTERN = re.compile(r"([\d+\-]+)")


def app_version() -> str:
    return pkg_resources.get_distribution("claude").version


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


def tree_search_list(selector: str, tree: ElementTree, fail_on_not_found=True) -> list:
    sel = CSSSelector(selector)
    res = sel(tree)
    if not len(res) and fail_on_not_found:
        raise SelectorNotFoundInTree(f"Selector '{selector}' not found.")
    return res


def tree_search(selector: str, tree: ElementTree) -> Element:
    return tree_search_list(selector, tree)[0]


def create_json_serializable_data(data):
    if isinstance(data, list):
        return [create_json_serializable_data(val) for val in data]
    elif isinstance(data, dict):
        return {key: create_json_serializable_data(val) for key, val in data.items()}
    elif isinstance(data, BaseModel):
        return data.dict()
    elif isinstance(data, ObjectType):
        return data.__dict__
    else:
        return data


class CalledProcessorError(Exception):
    def __init__(self, code, stdout, stderr):
        self.code = code
        self.stdout = stdout
        self.stderr = stderr
        super().__init__("CalledProcessorError code %s" % code)


async def check_output(cmd):
    proc = await asyncio.create_subprocess_shell(cmd, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE)
    stdout, stderr = await proc.communicate()
    if proc.returncode != 0:
        raise CalledProcessorError(proc.returncode, stdout, stderr)
    return stdout


def is_in_string_list(search: str, data: list[str]) -> bool:
    return len([i for i in data if search in i]) > 0


class TaskGatherer:
    def __init__(self) -> None:
        self._names: list[str] = []
        self._tasks = []

    def append_task(self, task: Awaitable, name: str):
        self._tasks.append(task)
        self._names.append(name)

    async def wait(self) -> dict[str, Any]:
        results = await asyncio.gather(*self._tasks)
        return {name: results[idx] for idx, name in enumerate(self._names)}
