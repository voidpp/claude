import { Box, SxProps } from '@mui/material';
import deepEqual from 'deep-equal';
import { ResizeDirection } from "re-resizable";
import * as React from "react";
import { useState } from "react";
import { DraggableEvent } from "react-draggable";
import { DraggableData, Position, Props, ResizableDelta, Rnd } from "react-rnd";
import { useAppSettings } from '../settings';
import { WidgetConfig } from "../types";

export const useRnd = (config: WidgetConfig, stepSize: number): Props => {
    const { saveWidget } = useAppSettings();
    const [position, setPosition] = useState({
        x: config.x,
        y: config.y,
    });
    const [size, setSize] = useState({
        width: config.width,
        height: config.height,
    });

    const updatePosition = (newData: typeof position) => {
        if (deepEqual(newData, position))
            return;
        setPosition(newData);
    };

    const onDragStop = (e: DraggableEvent, data: DraggableData) => {
        if (config.x == data.lastX && config.y == data.lastY)
            return;
        updatePosition({
            x: data.lastX,
            y: data.lastY,
        });
        saveWidget({
            ...config,
            x: data.lastX,
            y: data.lastY,
        });
    };

    const onDrag = (e: DraggableEvent, data: DraggableData) => {
        updatePosition({
            x: data.x,
            y: data.y,
        });
    };

    const onResizeStop = (e: MouseEvent, dir: ResizeDirection, elementRef: HTMLDivElement, delta: ResizableDelta, newPosition: Position) => {
        onResize(e, dir, elementRef, delta, newPosition);
        saveWidget({
            ...config,
            width: elementRef.offsetWidth,
            height: elementRef.offsetHeight,
        });
    };

    const onResize = (e: MouseEvent, dir: ResizeDirection, elementRef: HTMLDivElement, delta: ResizableDelta, newPosition: Position) => {
        const newData = {
            x: newPosition.x,
            y: newPosition.y,
            width: elementRef.offsetWidth,
            height: elementRef.offsetHeight,
        };
        if (deepEqual(newData, { ...position, ...size }))
            return;

        setPosition({ ...newData });
        setSize({ ...newData });
    };

    return {
        position: {
            x: position.x,
            y: position.y
        },
        size: {
            width: size.width,
            height: size.height,
        },
        dragGrid: [stepSize, stepSize],
        resizeGrid: [stepSize, stepSize],
        onDragStop,
        onResizeStop,
        onDrag,
        onResize,
        style: { userSelect: 'none' },
        enableUserSelectHack: false,
    }
}

const bodyStyle: SxProps = {
    borderRadius: 2,
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    backdropFilter: 'blur(3px)',
    // '&:hover .widget-menu': {
    //     opacity: 1,
    // },    
}

export type RndFrameProps = {
    rndProps: Props,
    children: React.ReactNode,
    style?: React.CSSProperties,
}

export const RndFrame = ({ rndProps: rnd, children, style }: RndFrameProps) => (
    <Rnd {...rnd}>
        <Box
            // className={classNames(classes.body, props.className, { [classes.hiddenMenuIcon]: isIdle })}
            style={{ ...style }}
            sx={bodyStyle}
        >
            {children}
        </Box>
    </Rnd>
)
