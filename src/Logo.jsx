import { Box } from '@mui/material';

export default function Logo() {
    return (
        <Box sx={{ '@media (max-height:500px)': { display: 'none' } }}>
            <img src="assets/logo.svg" style={{ display: 'block', width: 80, height: 80 }} />
        </Box>
    );
};
