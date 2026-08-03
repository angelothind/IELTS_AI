import './page.css';
import { useState, useRef, useEffect, useLayoutEffect } from 'react';

const Page = ({ id, pageNumber, pageText, registerTextarea, writing, bottomPage, createPage, removePage, focusPage, previousPageExcess, writingToExcess }) => {
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
    if (isOverflowing && bottomPage ) {
      const nextPageId = createPage();
      const textarea = textareaRef.current;
      const cursorIsAtEnd =
        document.activeElement === textarea &&
        textarea.selectionStart === text.length &&
        textarea.selectionEnd === text.length;

      if (cursorIsAtEnd) {
        focusPage(nextPageId);
      }
    }
  }, [isOverflowing, bottomPage, createPage, focusPage, text]);


  const handleKeyDown = (event) => {
    if (
      // if event = delete, this page is bottom page and its not the first page + is empty
      (event.key === 'Backspace' || event.key === 'Delete') &&
      bottomPage &&
      pageNumber !== 1 &&
      text === ''
    ) {
      event.preventDefault();
      removePage(id);
    }
  };

  const handleEdit = (event) => {
    const alteration = event.currentTarget.value;
    const isAddition = alteration.length > text.length;
    const isNowOverflowing =
      event.currentTarget.scrollHeight > event.currentTarget.clientHeight;

    if (isAddition && isNowOverflowing) {
      const x = alteration.length - text.length;
      const beforeExcess = alteration.slice(0, -x);
      const excess = alteration.slice(-x);

      writingToExcess(pageNumber - 1, excess);
      writing(id, beforeExcess);
      setIsOverflowing(true);
      return;
    }

    writing(id, alteration);
  };

  useEffect(() => {
    const previousExcess = previousPageExcess?.[0] ?? '';

    if (previousExcess !== '') {
      writing(id, previousExcess + text);
      writingToExcess(pageNumber - 2, '');
    }
  }, [id, pageNumber, previousPageExcess, text, writing, writingToExcess]);

  return (
    <div className="page">
      <textarea
        ref={(element) => {
          textareaRef.current = element;
          registerTextarea(id, element);
        }}
        // pass the ref to the textarea
        className="page-editor"
        // pass the value to the textarea
        value={text}
        // pass the onChange function to the textarea
        onChange={handleEdit}
        onKeyDown={(event) => {handleKeyDown(event)}}
        placeholder="Start writing..."
        aria-label="Writing editor"
      />
    </div>
  );
};

export default Page;
