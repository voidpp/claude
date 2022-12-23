from graphene import ObjectType

from claude.api.nodes.remove_widget import RemoveWidgetNode
from claude.api.nodes.save_dashboard import SaveDashboardNode
from claude.api.nodes.save_plugin import SavePluginNode
from claude.api.nodes.save_widget import SaveWidgetNode


class Mutation(ObjectType):
    save_widget = SaveWidgetNode.field()
    save_dashboard = SaveDashboardNode.field()
    save_plugin = SavePluginNode.field()

    remove_widget = RemoveWidgetNode.field()
