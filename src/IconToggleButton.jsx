import PropTypes from 'prop-types';
import { Typography, Stack, ToggleButton } from '@mui/material';

export default function IconToogleButton({ title = "", selected = false, onChange,
    iconOn, iconOff = null, ...rest }) {
    return (
        <ToggleButton selected={selected} onChange={onChange}
            title={title} {...rest}>
            {selected ? iconOn : (iconOff ? iconOff : iconOn)}
        </ToggleButton>
    );
};
