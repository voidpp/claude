from graphene import Field, ObjectType
from graphql import FieldNode


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
            names.append(sub_field.name.value)

    return [node.name.value + "." + n for n in names]
