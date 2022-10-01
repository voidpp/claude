class QueryProcessingError(Exception):
    pass


class SelectorNotFoundInTree(QueryProcessingError):
    pass


class CannotParseTemperature(QueryProcessingError):
    pass
