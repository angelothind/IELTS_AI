import React from 'react';
import './button.css';
import { useState } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

const Button = ({onClick, isFinished}) =>{
    if (!isFinished) {
        return (    
            <button className="submit-button" onClick={onClick}>Submit</button>
        )
    } else {
        return (   
            <button className="submit-button" onClick={onClick}><ArrowBackIcon /></button>
        )
    }


}



export default Button;
