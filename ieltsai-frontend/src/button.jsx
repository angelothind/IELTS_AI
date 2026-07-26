import React from 'react';
import './button.css';
import { useState } from 'react';
import { ArrowBackIcon } from '@mui/icons-material';

const Button = ({onClick}) =>{
    const [submitted, setSubmitted] = useState(false);
    if (!submitted) {
        return (
            <div className="button-container">
            <button className="submit-button" onClick={onClick}>Submit</button>
            </div>
        )
    } else {
        return (
            <div className="button-container">
            <button className="submit-button" onClick={onClick}><ArrowBackIcon /></button>
            </div>
        )
    }
}

export default Button;
