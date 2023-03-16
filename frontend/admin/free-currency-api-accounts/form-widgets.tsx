import { useNotifications } from "@/notifications";
import { useAppSettings } from "@/settings";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from "@mui/material";
import * as React from "react";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { FormContainer } from "../../widgets";

type AccountFormData = {
    name: string;
    apiKey: string;
};

type AccountFormDialogProps = {
    open: boolean;
    onClose: () => void;
    accountId: string;
};

export const AccountFormDialog = ({ open, onClose, accountId }: AccountFormDialogProps) => {
    const { saveFreeCurrencyApiAccount, settings } = useAppSettings();

    const [formData, setFormData] = useState<AccountFormData>({
        name: "",
        apiKey: "",
    });

    const { showNotification } = useNotifications();

    useEffect(() => {
        if (accountId === null) return;
        const account = settings.freeCurrencyApiAccounts.filter(acc => acc.id === accountId)[0];
        setFormData({ name: account?.name ?? "", apiKey: account?.apiKey ?? "" });
    }, [accountId]);

    const updateData = (key: keyof AccountFormData, value: any) => {
        setFormData({ ...formData, [key]: value });
    };

    const dataUpdater =
        (key: keyof AccountFormData, converter: (val: string) => any = (val: string) => val) =>
        (event: React.ChangeEvent<HTMLInputElement>) => {
            updateData(key, converter(event.target.value));
        };

    const submitEnabled = !!(formData.name.length > 1 && formData.apiKey.length > 1);

    const submit = async () => {
        await saveFreeCurrencyApiAccount({
            id: accountId.length ? accountId : uuidv4(),
            name: formData.name,
            apiKey: formData.apiKey,
        });

        showNotification("Account saved");
        close();
    };

    const close = () => {
        onClose();
    };

    return (
        <Dialog open={open} onClose={close}>
            <DialogTitle>New FreeCurrencyAPI Account</DialogTitle>
            <DialogContent>
                <FormContainer>
                    <Typography>Name</Typography>
                    <TextField variant="outlined" size="small" value={formData.name} onChange={dataUpdater("name")} />
                    <Typography>API Key</Typography>
                    <TextField
                        variant="outlined"
                        size="small"
                        value={formData.apiKey}
                        onChange={dataUpdater("apiKey")}
                    />
                </FormContainer>
            </DialogContent>
            <DialogActions>
                <Button disabled={!submitEnabled} onClick={submit}>
                    submit
                </Button>
                <Button onClick={close}>close</Button>
            </DialogActions>
        </Dialog>
    );
};
