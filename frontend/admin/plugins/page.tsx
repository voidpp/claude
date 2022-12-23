import { Box, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import * as React from "react";
import { useAppSettings } from "../../settings";
import { PageTitle } from "../widgets";
import { NewPluginButton } from "./form-dialog";

export const Plugins = () => {
    const { settings } = useAppSettings();
    return (
        <Box>
            <PageTitle title="Plugins">
                <NewPluginButton />
            </PageTitle>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Title</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell />
                    </TableRow>
                </TableHead>
                <TableBody>
                    {settings?.plugins.map(plugin => (
                        <TableRow key={plugin.id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                            <TableCell>{plugin.title}</TableCell>
                            <TableCell>{plugin.type}</TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Box>
    );
};
