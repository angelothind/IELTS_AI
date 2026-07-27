import React, { useState } from 'react';
import './toolbar.css';
import Button from './button';
import Timer from './timer';

const Toolbar = () => {
    const [isFinished, setIsFinished] = useState(false);
    return (
        <div className="toolbar-container">
            <nav className="toolbar">
                <Timer isFinished={isFinished} setIsFinished={setIsFinished} />
                <span className="entry-text">Please write your essay below</span>
                <Button onClick={() => setIsFinished(true)} isFinished={isFinished} className="submit-button"/>
      </nav>
    </div>
  );
};

export default Toolbar;