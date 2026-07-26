import React from 'react';
import './toolbar.css';
import Button from './button';

const Toolbar = () => {
    return (
        <div className="toolbar-container">
            <nav className="toolbar">
                <span className="timer">Timer Placeholder</span>
                <span className="entry-text">Please write your essay below</span>
                <Button onClick={() => {}}  className="submit-button"/>
            </nav>
        </div>
    )
}

export default Toolbar;