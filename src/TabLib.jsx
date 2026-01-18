import { useRef, useState, useEffect, useLayoutEffect } from "react";
import {
    Paper, Box, Stack, Button, Typography,
    List, ListItemButton, ListItemText
} from '@mui/material';
import Logo from './Logo'
import { getBandName, getSongName } from "./mix";

export default function TabLib({
    tabLib,         // []
    onTabSelect,    // onTabSelect(filename)
    recent = null,   // String[]
    sx = {} }) {
    const fileInputRef = useRef(null);
    const songsRef = useRef(null);
    const [selectedBand, setSelectedBand] = useState(-1);

    useEffect(() => {
        if (selectedBand < 0 && !recent)
            setSelectedBand(0);
    }, []);

    useLayoutEffect(() => {
        const el = songsRef.current;
        if (el) el.scrollTop = 0;
    }, [selectedBand]);


    function openFilePicker() {
        fileInputRef.current?.click();
    }

    function handleFile(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            onTabSelect(e.target.result);
        };

        reader.readAsArrayBuffer(file);
    }

    function showRecent() {
        if (recent)
            setSelectedBand(-1);
    }

    return (
        <Stack alignItems="center" spacing={1} padding={1} sx={sx}>
            <Logo />
            <Paper elevation={2} sx={{
                height: '100%',
                width: '100%',
                minHeight: 100,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}>
                <Stack direction="row" sx={{ flexGrow: 1, minHeight: 0 }} >
                    <Paper sx={{
                        minWidth: 160,
                        position: 'relative',
                        overflowY: 'auto'
                    }}>
                        <List>
                            {tabLib.map((item, index) => (
                                <ListItemButton key={index} selected={selectedBand === index}
                                    onClick={() => setSelectedBand(index)}>
                                    <ListItemText primary={<Typography sx={{ fontWeight: 'bold' }}>{item.band}</Typography>} />
                                </ListItemButton>
                            ))}
                        </List>
                    </Paper>
                    <List ref={songsRef}
                        sx={{
                            width: '100%', position: 'relative', overflowY: 'auto'
                        }}>
                        {selectedBand >= 0 ?
                            tabLib[selectedBand].tabs.map((tab, index) => (
                                <ListItemButton key={index}
                                    onClick={() => onTabSelect(`${tabLib[selectedBand].band} - ${tab}`)}>
                                    <ListItemText primary={getSongName(tab)} />
                                </ListItemButton>))
                            : recent ? recent.map((tab, index) => (
                                <ListItemButton key={index}
                                    onClick={() => onTabSelect(`${tab}`)}>
                                    <ListItemText primary={getSongName(tab)} secondary={getBandName(tab)} />
                                </ListItemButton>))
                                : <span>No recent tablatures</span>
                        }
                    </List>
                </Stack>
            </Paper>
            <Stack direction="row" spacing={1}>
                <input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={handleFile}
                    accept=".gp,.gp3,.gp4,.gp5,.gpx" />
                <Button variant="outlined" onClick={openFilePicker}>
                    Load Tab File
                </Button>
                <Button variant="outlined" onClick={showRecent} disabled={recent == null}>
                    Recent Tabs
                </Button>
            </Stack>
        </Stack >
    );
}