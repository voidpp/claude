from graphene import Schema

from claude.api.mutations import Mutation
from claude.api.queries import Query


def create_api_schema() -> Schema:
    api_schema = Schema(query=Query, mutation=Mutation)
    return api_schema
