import { BaseWidgetSettings, CommonWidgetProps } from "@/types";
import { Box, SxProps } from "@mui/material";
import * as React from "react";
import { useInterval } from "../../hooks";
import { IfComp } from "../../widgets";
import { RndFrame, useRnd } from "../rnd";
import { WidgetMenu } from "../widget-menu";
import { FormNumberFieldDescriptor } from "../widget-settings-dialog";

export class GallerySettings extends BaseWidgetSettings {
    imageUrls: string = "";
    interval: number = 30;
    showUrl: boolean = true;
    fadeTime: number = 1000;
}

export type GalleryProps = CommonWidgetProps<GallerySettings>;

const calcNextIndex = (current: number, max: number) => (current + 1 >= max ? 0 : current + 1);

const styles = {
    title: {
        position: "absolute",
        bottom: 0,
        left: 0,
        py: 0.5,
        px: 1,
        width: "100%",
        backgroundColor: "rgba(0,0,0,0.4)",
        backdropFilter: "blur(5px)",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },
    container: {
        width: "100%",
        height: "100%",
        position: "relative",
    },
    currentImage: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
    },
    nextImage: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
    },
} satisfies Record<string, SxProps>;

export const Gallery = ({ config }: GalleryProps) => {
    const { settings } = config;
    const rndProps = useRnd(config);
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const imageUrls = React.useMemo(
        () =>
            settings.imageUrls
                .split("\n")
                .map(url => url.trim())
                .filter(url => url.startsWith("http")),
        [settings.imageUrls]
    );
    const [nextOpacity, setNextOpacity] = React.useState(0);

    useInterval(() => {
        setNextOpacity(1);
        setTimeout(() => {
            setCurrentIndex(calcNextIndex(currentIndex, imageUrls.length));
            setNextOpacity(0);
        }, settings.fadeTime);
    }, settings.interval * 1000);

    const nextIndex = calcNextIndex(currentIndex, imageUrls.length);

    return (
        <RndFrame rndProps={rndProps}>
            <IfComp cond={imageUrls.length}>
                <Box sx={styles.container}>
                    <Box
                        sx={{
                            ...styles.nextImage,
                            opacity: nextOpacity,
                            transition: `opacity ${nextOpacity ? settings.fadeTime / 1000 : 0}s`,
                        }}
                        component="img"
                        src={imageUrls[nextIndex]}
                        draggable={false}
                    />
                    <Box sx={styles.currentImage} component="img" src={imageUrls[currentIndex]} draggable={false} />
                    <IfComp cond={settings.showUrl}>
                        <Box sx={styles.title}>{imageUrls[currentIndex]}</Box>
                    </IfComp>
                </Box>
            </IfComp>
            <WidgetMenu
                id={config.id}
                settings={config.settings}
                defaultOpen={!imageUrls.length}
                dialogMaxWidth="md"
                settingsFormFields={[
                    {
                        name: "imageUrls",
                        label: "Image URLs",
                        type: "multiLineString",
                    },
                    {
                        name: "interval",
                        label: "Interval in seconds",
                        min: 0,
                        max: 600,
                    } as FormNumberFieldDescriptor,
                    {
                        name: "showUrl",
                        label: "Show URL",
                        type: "boolean",
                    },
                    {
                        name: "fadeTime",
                        label: "Fade time",
                        min: 0,
                        max: 10000,
                    } as FormNumberFieldDescriptor,
                ]}
            />
        </RndFrame>
    );
};
