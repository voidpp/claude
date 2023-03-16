import { useNotifications } from "@/notifications";
import { useAppSettings } from "@/settings";
import AddBoxIcon from "@mui/icons-material/AddBox";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
    Box,
    Button,
    IconButton,
    Link,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
} from "@mui/material";
import * as React from "react";
import { useEffect, useState } from "react";
import { PageTitle } from "../widgets";
import { AccountFormDialog } from "./form-widgets";

type StatusResponse = {
    account_id: number;
    quotas: {
        month: {
            total: number;
            used: number;
            remaining: number;
        };
    };
};

const fetchStatus = async (apiKey: string): Promise<StatusResponse> => {
    const response = await fetch("https://api.freecurrencyapi.com/v1/status", { headers: { apikey: apiKey } });
    return await response.json();
};

const AccountStatus = ({ apiKey }: { apiKey: string }) => {
    const [status, setStatus] = useState<StatusResponse>();

    useEffect(() => {
        fetchStatus(apiKey).then(result => setStatus(result));
    }, [apiKey]);

    if (!status?.quotas) return <span>?</span>;

    return (
        <Typography>
            {status?.quotas.month.used} / {status?.quotas.month.total} (
            {Math.round((status?.quotas.month.used / status?.quotas.month.total) * 1000) / 10} %)
        </Typography>
    );
};

export const FreeCurrencyAPIAccountsPage = () => {
    const [accountId, setAccountId] = React.useState<string>(null);
    const { settings, removeFreeCurrencyApiAccount } = useAppSettings();
    const { showNotification } = useNotifications();

    return (
        <Box>
            <PageTitle title="Free Currency API Accounts">
                <Button onClick={() => setAccountId("")}>
                    <AddBoxIcon sx={{ mr: 1 }} />
                    add new
                </Button>
            </PageTitle>
            <Typography>
                Get API key from <Link href="https://freecurrencyapi.com/">freecurrencyapi.com</Link>
            </Typography>
            <Box sx={{ mt: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Quotas</TableCell>
                            <TableCell />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {settings?.freeCurrencyApiAccounts.map(account => (
                            <TableRow key={account.id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                                <TableCell>{account.name}</TableCell>
                                <TableCell>
                                    <AccountStatus apiKey={account.apiKey} />
                                </TableCell>
                                <TableCell>
                                    <IconButton onClick={() => setAccountId(account.id)} size="small">
                                        <Tooltip title="Edit">
                                            <EditIcon fontSize="small" />
                                        </Tooltip>
                                    </IconButton>
                                    <IconButton
                                        onClick={async () => {
                                            await removeFreeCurrencyApiAccount(account.id);
                                            showNotification("The account has been removed");
                                        }}
                                        size="small"
                                        sx={{ ml: 1 }}
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
            <AccountFormDialog open={accountId !== null} onClose={() => setAccountId(null)} accountId={accountId} />
        </Box>
    );
};
