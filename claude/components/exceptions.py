class QueryProcessingError(Exception):
    pass


class SelectorNotFoundInTree(QueryProcessingError):
    pass


class CannotParseNumber(QueryProcessingError):
    pass
