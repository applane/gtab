import { ToggleButton, Select } from "@mui/material";
import { styled, darken } from "@mui/material/styles";

const g_playColor = '#4eb71ebf';

export const TrackSelect = styled(Select)({
    minWidth: 100,
    maxWidth: 220,
    minHeight: 47,
    "& .MuiOutlinedInput-input": { paddingTop: 7, paddingBottom: 7 }
});

export const PlayButton = styled(ToggleButton)({
    color: 'white',
    backgroundColor: darken(g_playColor, 0.1),
    '&:hover': {
        backgroundColor: darken(g_playColor, 0.2),
    },
    "&.Mui-selected": {
        color: 'white',
        backgroundColor: g_playColor
    },
    "&.Mui-selected:hover": {
        backgroundColor: darken(g_playColor, 0.2)
    }
});
