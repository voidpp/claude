from graphene import Field, ObjectType


def create_nested_field(type_: ObjectType):
    async def resolver(root, info):
        return type_()

    return Field(type_, resolver=resolver)
