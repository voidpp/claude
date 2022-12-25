import { PluginType } from "@/graphql-types-and-hooks";
import { useBoolState } from "@/hooks";
import { useNotifications } from "@/notifications";
import { useAppSettings } from "@/settings";
import { FormContainer, IfComp } from "@/widgets";
import ClearIcon from "@mui/icons-material/Clear";
import FileOpenIcon from "@mui/icons-material/FileOpen";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    MenuItem,
    Select,
    TextField,
    Typography,
} from "@mui/material";
import * as React from "react";
import { v4 as uuidv4 } from "uuid";

type PluginFormData = {
    name: string;
    className: string;
    file: File;
    type: PluginType;
};

const readFileContent = (file: File) =>
    new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = () => resolve(reader.result.toString());
        reader.onerror = error => reject(error);
    });

export const NewPluginButton = () => {
    const { savePlugin } = useAppSettings();
    const [isOpen, open, close] = useBoolState();
    const fileInputRef = React.useRef<HTMLInputElement>();
    const [formData, setFormData] = React.useState<PluginFormData>({
        name: "",
        type: PluginType.Weather,
        file: null,
        className: "",
    });
    const { showNotification } = useNotifications();

    const updateData = (key: keyof PluginFormData, value: any) => {
        setFormData({ ...formData, [key]: value });
    };

    const dataUpdater =
        (key: keyof PluginFormData, converter: (val: string) => any = (val: string) => val) =>
        (event: React.ChangeEvent<HTMLInputElement>) => {
            updateData(key, converter(event.target.value));
        };

    const submitEnabled = !!(formData.name.length > 1 && formData.file);

    const submit = async () => {
        const fileData = await readFileContent(formData.file);
        const result = await savePlugin(uuidv4(), fileData, formData.name, formData.type, formData.className);

        if (result.error) showNotification(result.error, "error");
        else {
            showNotification("Plugin saved");
            close();
        }
    };

    return (
        <>
            <Button onClick={open}>add new</Button>
            <Dialog open={isOpen} onClose={close}>
                <DialogTitle>New plugin</DialogTitle>
                <DialogContent>
                    <FormContainer>
                        <Typography>Name</Typography>
                        <TextField
                            variant="outlined"
                            size="small"
                            value={formData.name}
                            onChange={dataUpdater("name")}
                        />
                        <Typography>Type</Typography>
                        <Select value={formData.type} onChange={dataUpdater("type")} size="small">
                            {Object.entries(PluginType).map(([key, value]) => (
                                <MenuItem key={key} value={value}>
                                    {key}
                                </MenuItem>
                            ))}
                        </Select>
                        <Typography>File</Typography>
                        <Box>
                            <TextField
                                required
                                variant="outlined"
                                size="small"
                                value={formData.file?.name ?? ""}
                                InputProps={{
                                    readOnly: true,
                                    endAdornment: (
                                        <IfComp cond={!!formData.file}>
                                            <IconButton size="small" onClick={() => updateData("file", null)}>
                                                <ClearIcon fontSize="small" />
                                            </IconButton>
                                        </IfComp>
                                    ),
                                }}
                            />
                            <IconButton sx={{ ml: 1 }} onClick={() => fileInputRef.current.click()}>
                                <FileOpenIcon />
                            </IconButton>
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: "none" }}
                                onChange={_ => updateData("file", fileInputRef.current.files[0])}
                            />
                        </Box>
                        <Typography>Class name</Typography>
                        <TextField
                            variant="outlined"
                            size="small"
                            value={formData.className}
                            onChange={dataUpdater("className")}
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
        </>
    );
};
