import React from 'react';
import './timer.css';
import { useState, useEffect } from 'react';

const TOTAL_SECONDS = 40 * 60; // 40 minutes

const Timer = ({isFinished,setIsFinished}) => {
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) {
      setIsFinished(true);
      return;
    }

    else if (isFinished) {
      return;
    }

    const intervalId = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [secondsLeft]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return <span>Time Remaining: {display}</span>;
};

export default Timer;