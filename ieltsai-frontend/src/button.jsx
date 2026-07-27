import React from 'react';
import './button.css';
import { useState } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

const Button = ({onClick}) =>{
    const [submitted, setSubmitted] = useState(false);
    const handleSubmit = () => {
        setSubmitted(true);
        onClick();
    }
    if (!submitted) {
        return (    
            <button className="submit-button" onClick={handleSubmit}>Submit</button>
        )
    } else {
        return (   
            <button className="submit-button" onClick={handleSubmit}><ArrowBackIcon /></button>
        )
    }


}



export default Button;
