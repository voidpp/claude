import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, TextField, Typography } from "@mui/material";
import * as React from "react";
import { useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import { Dashboard, DashboardInput } from '../graphql-types-and-hooks';
import { useNotifications } from "../notifications";
import { useAppSettings } from "../settings";
import { FormContainer } from "../widgets";



type Props = {
    isOpen: boolean,
    close: () => void,
};

const createDefaultValues = (): DashboardInput => ({
    id: uuidv4(),
    name: "",
    background: "",
    stepSize: 10,
    theme: "",
    locale: "hu",
})

export const DashboardSettingsDialog = ({ isOpen, close }: Props) => {
    const { saveDashboard } = useAppSettings();
    const [data, setData] = useState<DashboardInput>(createDefaultValues());
    const { showNotification } = useNotifications();

    const dataUpdater =
        (key: keyof Dashboard, converter: (val: string) => any = (val: string) => val) =>
            (event: React.ChangeEvent<HTMLInputElement>) => {
                setData({ ...data, [key]: converter(event.target.value) })
            }

    const onSubmit = async () => {
        await saveDashboard(data);
        close();
        showNotification("Dashboard created");
    }

    return (
        <Dialog open={isOpen} onClose={close}>
            <DialogTitle>
                Create dashboard
            </DialogTitle>
            <Divider />
            <DialogContent>
                <FormContainer>
                    <Typography>Name</Typography>
                    <TextField
                        required
                        variant="outlined"
                        size="small"
                        value={data.name}
                        onChange={dataUpdater("name")}
                    />
                    <Typography>Step size</Typography>
                    <TextField
                        variant="outlined"
                        size="small"
                        type="number"
                        value={data.stepSize}
                        onChange={dataUpdater("stepSize", parseInt)}
                    />
                    <Typography>Theme</Typography>
                    <TextField
                        variant="outlined"
                        size="small"
                        value={data.theme}
                        onChange={dataUpdater("theme")}
                    />
                    <Typography>Locale</Typography>
                    <TextField
                        variant="outlined"
                        size="small"
                        value={data.locale}
                        onChange={dataUpdater("locale")}
                    />
                </FormContainer>
            </DialogContent>
            <Divider />
            <DialogActions>
                <Button onClick={onSubmit}>submit</Button>
                <Button onClick={close}>cancel</Button>
            </DialogActions>
        </Dialog>
    );
}
