import * as React from "react";
import { RndFrame, useRnd } from "../../rnd";
import { WidgetMenu } from "../../widget-menu";
import { BaseWidgetSettings, CommonWidgetProps } from "@/types";
import { useHomeAssistantStatesEx } from "@/home-assistant/client";
import { FormListFieldDescriptor, FormSelectFieldDescriptor } from "@/components/widget-settings/types";
import { useHAStatesSubscription } from "@/home-assistant/websocket-hooks";
import { Box, useTheme } from "@mui/material";
import dayjs from "dayjs";

export type HEEntitySettings = {
  entityName: string;
  title: string;
  unit: string;
};

export class HAEntityListSettings extends BaseWidgetSettings {
  title: string = "";
  entities: Record<string, HEEntitySettings> = {};
}

export type HAEntityListProps = CommonWidgetProps<HAEntityListSettings>;

const formatValue = (value: string | undefined, deviceClass: string | undefined): string => {
  if (value === undefined) return "";

  if (deviceClass === "timestamp") {
    return dayjs(value).format("HH:mm");
  }
  return value;
};

export const HAEntityList = (props: HAEntityListProps) => {
  const { config } = props;
  const rndProps = useRnd(config);
  const { data: stateList } = useHomeAssistantStatesEx();
  const states = useHAStatesSubscription(
    Object.entries(config.settings.entities).map(([_, value]) => value.entityName)
  );

  const entityStates = React.useMemo(() => {
    if (!stateList) return {};
    return Object.values(config.settings.entities).reduce((acc, value) => {
      const state = stateList.find(state => state.entity_id === value.entityName);
      if (state) {
        acc[value.entityName] = state;
      }
      return acc;
    }, {} as Record<string, typeof stateList[number]>);
  }, [config.settings.entities, stateList]);

  return (
    <RndFrame rndProps={rndProps} sx={{ p: 1 }}>
      {config.settings.title && (
        <Box
          sx={{
            fontSize: "1.2em",
            fontWeight: "bold",
            mb: 1,
            textAlign: "center",
          }}
        >
          {config.settings.title}
        </Box>
      )}
      {Object.entries(config.settings.entities).map(([key, value]) => {
        const unit = value.unit || entityStates[value.entityName]?.attributes?.unit_of_measurement || "";
        const title = value.title || entityStates[value.entityName]?.attributes?.friendly_name || "";
        const deviceClass = entityStates[value.entityName]?.attributes?.device_class;

        return (
          <Box
            key={key}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0.5em 1em",
            }}
          >
            <Box>{title}</Box>
            <Box>
              {formatValue(states?.[value.entityName], deviceClass)}
              {unit}
            </Box>
          </Box>
        );
      })}
      <WidgetMenu
        id={config.id}
        settings={config.settings}
        defaultOpen={Object.keys(config.settings.entities).length === 0}
        settingsFormFields={[
          {
            name: "title",
            label: "Title",
            default: "",
          },
          {
            type: "list",
            label: "Entities",
            name: "entities",
            fields: [
              {
                name: "entityName",
                label: "Entity",
                type: "select",
                small: true,
                options:
                  stateList?.map(state => ({
                    value: state.entity_id,
                    label: state.name,
                    subLabel: state.entity_id,
                  })) ?? [],
              } as FormSelectFieldDescriptor,
              {
                name: "title",
                label: "Title",
                default: "",
                small: true,
              },
              {
                name: "unit",
                label: "Unit",
                default: "",
                small: true,
              },
            ],
          } as FormListFieldDescriptor,
        ]}
      />
    </RndFrame>
  );
};
