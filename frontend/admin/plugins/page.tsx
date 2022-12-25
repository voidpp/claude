import { useNotifications } from "@/notifications";
import { useAppSettings } from "@/settings";
import DeleteIcon from "@mui/icons-material/Delete";
import { Box, IconButton, Table, TableBody, TableCell, TableHead, TableRow, Tooltip } from "@mui/material";
import * as React from "react";
import { PageTitle } from "../widgets";
import { NewPluginButton } from "./form-dialog";

export const Plugins = () => {
    const { settings, removePlugin } = useAppSettings();
    const { showNotification } = useNotifications();
    return (
        <Box>
            <PageTitle title="Plugins">
                <NewPluginButton />
            </PageTitle>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell />
                    </TableRow>
                </TableHead>
                <TableBody>
                    {settings?.plugins.map(plugin => (
                        <TableRow key={plugin.id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                            <TableCell>{plugin.name}</TableCell>
                            <TableCell>{plugin.type}</TableCell>
                            <TableCell>
                                <IconButton
                                    onClick={async () => {
                                        await removePlugin(plugin.id);
                                        showNotification("Plugin has been removed");
                                    }}
                                    size="small"
                                >
                                    <Tooltip title="Delete">
                                        <DeleteIcon fontSize="small" />
                                    </Tooltip>
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Box>
    );
};
