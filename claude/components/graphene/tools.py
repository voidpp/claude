from graphene import Field, ObjectType
from graphql import FieldNode
from graphql.pyutils.convert_case import camel_to_snake


def create_nested_field(type_: ObjectType):
    async def resolver(root, info):
        return type_()

    return Field(type_, resolver=resolver)


def get_field_name_list(node: FieldNode) -> list[str]:
    names = []
    for sub_field in node.selection_set.selections:
        if not isinstance(sub_field, FieldNode):
            continue
        if sub_field.selection_set:
            names += get_field_name_list(sub_field)
        else:
            names.append(camel_to_snake(sub_field.name.value))

    return [camel_to_snake(node.name.value) + "." + n for n in names]
