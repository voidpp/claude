import { SunriseSunset as SunriseSunsetType, useSunriseSunsetQuery } from "@/graphql-types-and-hooks";
import { BaseWidgetSettings, CommonWidgetProps } from "@/types";
import { Box } from "@mui/system";
import dayjs from "dayjs";
import * as React from "react";
import { useInterval } from "../../hooks";
import { RndFrame, useRnd } from "../rnd";
import { WidgetMenu } from "../widget-menu";

export class SunriseSunsetSettings extends BaseWidgetSettings {
    city: string = "Budapest";
}

const dayInMsecs = 1000 * 60 * 60 * 24;

export type SunriseSunsetProps = CommonWidgetProps<SunriseSunsetSettings>;

const labels: Record<keyof Omit<SunriseSunsetType, "__typename">, string> = {
    sunrise: "Sunrise",
    sunset: "Snset",
    solarNoon: "Solar noon",
    dayLength: "Day length",
    civilTwilightBegin: "Civil twilight begin",
    civilTwilightEnd: "Civil twilight end",
    nauticalTwilightBegin: "Nautical twilight begin",
    nauticalTwilightEnd: "Nautical twilight end",
    astronomicalTwilightBegin: "Astronomical twilight begin",
    astronomicalTwilightEnd: "Astronomical twilight end",
};

export const SunriseSunset = (props: SunriseSunsetProps) => {
    const { config } = props;
    const rndProps = useRnd(config);

    const { data, refetch } = useSunriseSunsetQuery({ variables: { city: config.settings.city } });

    useInterval(() => {
        refetch();
    }, dayInMsecs);

    return (
        <RndFrame rndProps={rndProps}>
            <Box sx={{ p: 1 }}>
                <Box component="table" sx={{ fontSize: "1.1em", "& td": { p: 1 } }}>
                    <tbody>
                        <tr>
                            <td>Sunrise:</td>
                            <td>{dayjs(data?.sunriseSunset.sunrise).format("HH:mm")}</td>
                        </tr>
                        <tr>
                            <td>Sunset:</td>
                            <td>{dayjs(data?.sunriseSunset.sunset).format("HH:mm")}</td>
                        </tr>
                    </tbody>
                </Box>
            </Box>
            <WidgetMenu
                id={config.id}
                settings={config.settings}
                defaultOpen={!config.settings.city}
                settingsFormFields={[
                    {
                        name: "city",
                        label: "City",
                    },
                ]}
            />
        </RndFrame>
    );
};
