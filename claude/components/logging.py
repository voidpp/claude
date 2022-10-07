import logging


def init_logger(debug: bool):
    logging.basicConfig(
        level=logging.DEBUG if debug else logging.INFO,
        format="%(asctime)s - %(levelname)s - %(filename)s:%(lineno)s: %(message)s",
    )
