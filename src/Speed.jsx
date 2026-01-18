import PropTypes from 'prop-types';
import { Typography, Stack, IconButton, Paper } from '@mui/material';
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";

function Speed({ title = "", speed = 1, maxSpeed = 1, onChange, disabled = false }) {
    function clamp(v) {
        return Math.max(0.5, Math.min(maxSpeed, v));
    }

    return (
        <Stack alignItems="center">
            <Paper variant="outlined" sx={{ bgcolor: 'inherit' }}>
                <Stack direction="row" alignItems="center" borderRadius={2} px={1} py={0.5}>
                    <IconButton onClick={() => onChange(clamp(speed - 0.05))} disabled={disabled}>
                        <ArrowLeftIcon />
                    </IconButton>
                    <Typography textAlign="center" sx={{ minWidth: '5ch' }} title={title}>
                        {(speed * 100).toFixed(0)}%
                    </Typography>
                    <IconButton onClick={() => onChange(clamp(speed + 0.05))} disabled={disabled}>
                        <ArrowRightIcon />
                    </IconButton>
                </Stack>
            </Paper>
        </Stack>
    );
};

Speed.propTypes = {
    title: PropTypes.string.isRequired,
    speed: PropTypes.number.isRequired,
    maxSpeed: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default Speed;