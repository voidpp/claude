from contextlib import contextmanager
from pathlib import Path
from unittest.mock import patch

from claude.components.fetcher import Fetcher


@contextmanager
def mock_fetch_url(filename: str):
    file = Path(__file__).parent / "resources" / filename
    content = file.read_text()

    async def fetcher(_):
        return content

    with patch.object(Fetcher, Fetcher.fetch_url.__name__, fetcher):
        yield
