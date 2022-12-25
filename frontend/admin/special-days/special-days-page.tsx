import { MonthView } from "@/components/calendar/month";
import {
    SpecialDayInput,
    SpecialDayType,
    useRemoveSpecialDaysMutation,
    useSaveSpecialDaysMutation,
    useSpecialDaysQuery,
} from "@/graphql-types-and-hooks";
import { Locales } from "@/types";
import { IfComp } from "@/widgets";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { Box, IconButton, Menu, MenuItem, Select, Typography } from "@mui/material";
import dayjs from "dayjs";
import * as React from "react";
import { useMemo, useState } from "react";
import { PageTitle } from "../widgets";

export const SpecialDaysPage = () => {
    const [year, setYear] = useState(new Date().getFullYear());
    const [locale, setLocale] = useState(Locales.Hungarian);
    const { data, refetch } = useSpecialDaysQuery();
    const [menuAnchor, setMenuAnchor] = useState<HTMLDivElement>();
    const [selectedDate, setSelectedDate] = useState<Date>();
    const [saveSpecialDays] = useSaveSpecialDaysMutation();
    const [removeSpecialDays] = useRemoveSpecialDaysMutation();
    const specialDaysMap = useMemo(() => {
        return data?.settings.specialDays
            .filter(sd => dayjs(sd.date).year() == year && sd.locale == locale)
            .reduce((curr, prev) => {
                curr[dayjs(prev.date).format("YYYY-MM-DD")] = prev.type;
                return curr;
            }, {} as Record<string, SpecialDayType>);
    }, [data?.settings.specialDays, year, locale]);

    const onSelectDate = (date: Date, container: HTMLDivElement) => {
        setMenuAnchor(container);
        setSelectedDate(date);
    };

    const closeMenu = () => {
        setMenuAnchor(null);
        setSelectedDate(null);
    };

    const onSetSpecialDay = async (type: SpecialDayType) => {
        const saveData: SpecialDayInput = {
            date: dayjs(selectedDate).format("YYYY-MM-DD"),
            locale,
            type,
        };
        await saveSpecialDays({ variables: { specialDays: [saveData] } });
        await refetch();
        closeMenu();
    };

    const removeSelectedSpecialDay = async () => {
        await removeSpecialDays({
            variables: { ids: [{ date: dayjs(selectedDate).format("YYYY-MM-DD"), locale }] },
        });
        await refetch();
        closeMenu();
    };

    const selectedDayHasSpecial = selectedDate && !!specialDaysMap[dayjs(selectedDate).format("YYYY-MM-DD")];

    return (
        <Box>
            <PageTitle title="Special days">
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography sx={{ mr: 2 }}>Locale:</Typography>
                    <Select
                        variant="outlined"
                        size="small"
                        value={locale}
                        onChange={ev => setLocale(ev.target.value as Locales)}
                    >
                        {Object.entries(Locales).map(([key, value]) => (
                            <MenuItem key={key} value={value}>
                                {key}
                            </MenuItem>
                        ))}
                    </Select>
                </Box>
            </PageTitle>
            <Box sx={{ display: "flex", justifyContent: "center", mb: 3, fontSize: "1.5em" }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <IconButton size="small" onClick={() => setYear(year - 1)}>
                        <NavigateBeforeIcon />
                    </IconButton>
                    <Box sx={{ mx: 1 }}>{year}</Box>
                    <IconButton size="small" onClick={() => setYear(year + 1)}>
                        <NavigateNextIcon />
                    </IconButton>
                </Box>
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", rowGap: 3 }}>
                {Array.from(Array(12).keys()).map(month => (
                    <MonthView
                        specialDays={data?.settings.specialDays ?? []}
                        year={year}
                        month={month}
                        key={month}
                        onSelectDate={onSelectDate}
                        selectedDate={selectedDate}
                        locale={locale}
                    />
                ))}
            </Box>
            <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={closeMenu}>
                <IfComp cond={!selectedDayHasSpecial}>
                    {Object.entries(SpecialDayType).map(([key, value]) => (
                        <MenuItem key={key} value={value} onClick={() => onSetSpecialDay(value)}>
                            {key.replace(/([a-z])([A-Z])/g, "$1 $2")}
                        </MenuItem>
                    ))}
                </IfComp>
                <IfComp cond={selectedDayHasSpecial}>
                    <MenuItem onClick={removeSelectedSpecialDay}>Delete special day</MenuItem>
                </IfComp>
            </Menu>
        </Box>
    );
};
