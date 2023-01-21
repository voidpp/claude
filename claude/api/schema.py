from graphene import Schema

from claude.api.mutations import Mutation
from claude.api.queries import Query
from claude.api.subscriptions import Subscription


def create_api_schema() -> Schema:
    api_schema = Schema(query=Query, mutation=Mutation, subscription=Subscription)
    return api_schema
