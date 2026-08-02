import './page.css';
import { useState, useRef, useLayoutEffect } from 'react';

const Page = ({ id, pageNumber, pageText, writing, bottomPage, createPage, removePage }) => {
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textareaRef = useRef(null);
  const text = pageText[0];

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    
    const checkOverflow = () => {
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
    if (isOverflowing && bottomPage) {
      createPage();
    }
  }, [isOverflowing, bottomPage, createPage]);

  const handleKeyDown = (event) => {
    if (
      (event.key === 'Backspace' || event.key === 'Delete') &&
      bottomPage &&
      pageNumber !== 1 &&
      text === ''
    ) {
      event.preventDefault();
      removePage(id);
    }
  };



  return (
    <div className="page">
      <textarea
        // pass the ref to the textarea
        ref={textareaRef}
        className="page-editor"
        // pass the value to the textarea
        value={text}
        // pass the onChange function to the textarea
        onChange={(event) => {writing(id, event.target.value);}}
        onKeyDown={(event) => {handleKeyDown(event)}}
        placeholder="Start writing..."
        aria-label="Writing editor"
        spellCheck
      />
    </div>
  );
};

export default Page;
