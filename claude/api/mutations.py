from graphene import ObjectType

from claude.api.nodes.remove_dashboard import RemoveDashboardNode
from claude.api.nodes.remove_speical_days import RemoveSpeicalDaysNode
from claude.api.nodes.remove_widget import RemoveWidgetNode
from claude.api.nodes.save_dashboard import SaveDashboardNode
from claude.api.nodes.save_plugin import SavePluginNode
from claude.api.nodes.save_special_days import SaveSpecialDaysNode
from claude.api.nodes.save_widget import SaveWidgetNode


class Mutation(ObjectType):
    save_dashboard = SaveDashboardNode.field()
    save_plugin = SavePluginNode.field()
    save_special_days = SaveSpecialDaysNode.field()
    save_widget = SaveWidgetNode.field()

    remove_speical_days = RemoveSpeicalDaysNode.field()
    remove_dashboard = RemoveDashboardNode.field()
    remove_widget = RemoveWidgetNode.field()
