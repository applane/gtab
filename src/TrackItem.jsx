import { IconButton, ListItemText, Stack, Slider, ListItemIcon, Radio, Icon, Typography, ListItemButton } from "@mui/material";
import VolumeUp from "@mui/icons-material/VolumeUp";
import VolumeOff from "@mui/icons-material/VolumeOff";
import MicNoneIcon from "@mui/icons-material/MicNone";
import MicIcon from "@mui/icons-material/Mic";

export default function TrackItem({ tracks, track, onTrackChange }) {

    function changeVolume(e, vol) {
        e.stopPropagation();
        track.volume = vol;
    }

    function stopPropagation(e) {
        e.stopPropagation();
    };

    function isSoloMute() {
        if (track.isSolo) return false;
        for (let it of tracks) {
            if (it.isSolo && it !== track)
                return true;
        }
        return false;
    }

    function onNameClick(e) {
        e.stopPropagation();
        onTrackChange(track.index)
    }

    return (
        <Stack direction="row" alignItems="center" width="100%" spacing={1}>
            <ListItemText sx={{ flex: 1, overflow: 'hidden' }}
                onMouseDown={stopPropagation}
                onTouchStart={stopPropagation}
                onClick={onNameClick}>
                {track.name}
            </ListItemText>
            <IconButton
                size="small"
                onClick={(e) => {
                    e.stopPropagation();
                    track.toggleSolo();
                }}
            >
                {track.isSolo ? <MicIcon /> : <MicNoneIcon />}
            </IconButton>
            <IconButton
                size="small"
                onClick={(e) => {
                    e.stopPropagation();
                    track.toggleMute();
                }}
            >
                {(track.isMute || isSoloMute()) ? <VolumeOff /> : <VolumeUp />}
            </IconButton>
            <Slider value={track.volume} max={16} onChange={changeVolume}
                onMouseDown={stopPropagation}
                onTouchStart={stopPropagation}
                style={{ width: 100 }} onClick={stopPropagation}
                disabled={track.isMute} />
        </Stack>
    );
}


