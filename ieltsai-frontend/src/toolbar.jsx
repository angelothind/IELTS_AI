import React from 'react';
import './toolbar.css';
import Button from './button';
import Timer from './timer';

const Toolbar = () => {
    return (
        <div className="toolbar-container">
            <nav className="toolbar">
                <Timer />
                <span className="entry-text">Please write your essay below</span>
                <Button  onClick={() => {}} className="submit-button"/>
            </nav>
        </div>
    )
}

export default Toolbar;