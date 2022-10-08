import logging
import re
from asyncio.log import logger

from claude.components.fetcher import Fetcher
from claude.components.server_status.types import ServerStatusData, ServerStatusResponse
from claude.components.tools import CalledProcessorError, check_output

logger = logging.getLogger(__name__)

ping_pattern = re.compile(
    r"64 bytes from ([0-9\.]{7,15}): icmp_.eq=([0-9]{1,2}) ttl=([0-9]{1,4}) time=([0-9\.]{1,7}) ms"
)


async def get_server_ping(ip: str) -> float | None:
    logger.debug("Pinging %s ...", ip)

    ping_cnt = 4

    try:
        ping_raw = await check_output("ping %s -c %d -i 0.2" % (ip, ping_cnt))
    except CalledProcessorError as e:
        logger.debug("Ping failed %s", e)
        return None

    ping_time_sum = 0
    for match in re.finditer(ping_pattern, ping_raw.decode()):
        ping_time_sum += float(match.group(4))

    return round(ping_time_sum / ping_cnt, 1)


async def get_server_status(ip: str, port: int) -> ServerStatusData | None:
    logger.debug("Get server status %s:%s ...", ip, port)

    try:
        server_details = await Fetcher.fetch_json("http://%s:%s/" % (ip, port))
    except Exception as e:
        logger.info("Cannot reach %s:%s because %s", ip, port, e)
        return None

    return ServerStatusData(**server_details)
