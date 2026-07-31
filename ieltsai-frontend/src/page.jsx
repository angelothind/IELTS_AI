import './page.css';
import { useState, useRef, useLayoutEffect } from 'react';

const Page = ({ value, onChange }) => {
  // state to monitor is textarea overflowing
  const [isOverflowing, setIsOverflowing] = useState(false);
  // ref to the textarea element
  const textareaRef = useRef(null);

  // useLayoutEffect to check if the textarea is overflowing
  useLayoutEffect(() => {
    const el = textareaRef.current;
    // if the textarea is not found, return
    if (!el) return;
    
    //define function to check if the textarea is overflowing
    const checkOverflow = () => {
      //use Boolean experssion
      setIsOverflowing(el.scrollHeight > el.clientHeight);
    };
    // call the function to check if the textarea is overflowing
    checkOverflow();
    
    // create a ResizeObserver to watch for changes in the textarea's height
    const observer = new ResizeObserver(checkOverflow);
    observer.observe(el);
    // clean up the observer when the component unmounts
    return () => observer.disconnect();
    // dependency array 
  }, [value]);

  return (
    <div className="page">
      <textarea
        // pass the ref to the textarea
        ref={textareaRef}
        className="page-editor"
        // pass the value to the textarea
        value={value}
        // pass the onChange function to the textarea
        onChange={(event) => onChange(event.target.value)}
        placeholder="Start writing..."
        aria-label="Writing editor"
        spellCheck
      />
    </div>
  );
};

export default Page;
