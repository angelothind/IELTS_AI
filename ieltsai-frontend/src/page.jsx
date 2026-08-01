import './page.css';
import { useState, useRef, useLayoutEffect, useEffect } from 'react';

const Page = ({ id, pageNumber, text, onChange, topPage, createPage, setPageToRemove }) => {
  // state to monitor is textarea overflowing and text area to reference the textarea element
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textareaRef = useRef(null);
  const [pageText, setPageText] = useState(text);

  // useLayoutEffect to check if the textarea is overflowing
  useLayoutEffect(() => {
    const el = textareaRef.current;
    // if the textarea is not found, return
    if (!el) return;
    
    //define function to check if the textarea is overflowing
    const checkOverflow = () => {
      //use Boolean experssion
      setIsOverflowing(el.scrollHeight > el.clientHeight);
      console.log(pageText);
    };
    checkOverflow();
    // create a ResizeObserver to watch for changes in the textarea's height
    const observer = new ResizeObserver(checkOverflow);
    observer.observe(el);
    // clean up the observer when the component unmounts
    return () => observer.disconnect();
  }, [pageText]);

  useLayoutEffect(() => {
    if (isOverflowing) {
      createPage();
    }
  },[isOverflowing]);

  const handleKeyDown = (event) => {
    if (
      (event.key === 'Backspace' || event.key === 'Delete') &&
      topPage &&
      pageNumber !== 1 &&
      pageText === ''
    ) {
      event.preventDefault();
      setPageToRemove(id);
    }
  };



  return (
    <div className="page">
      <textarea
        // pass the ref to the textarea
        ref={textareaRef}
        className="page-editor"
        // pass the value to the textarea
        value={pageText}
        // pass the onChange function to the textarea
        onChange={(event) => {onChange(event.target.value); setPageText(event.target.value);}}
        onKeydown = {(event) => {handleKeyDown(event)}}
        placeholder="Start writing..."
        aria-label="Writing editor"
        spellCheck
      />
    </div>
  );
};

export default Page;
