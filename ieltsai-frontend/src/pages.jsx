import { useState, useCallback, useRef } from 'react';
import './pages.css';
import Page from './page';

const Pages = () => {
  const [pages, setPages] = useState([
    { id: crypto.randomUUID(), text: '', excess: [''] },
  ]);
  const textareaRefs = useRef(new Map());
  const pendingFocus = useRef(null);

  //placeCaret function takes 2 parameters
  //textarea is a reference
  //caret is a number representing the caret position in a string
  const placeCaret = (textarea, caret) => {
    textarea.focus();
    if (caret !== null) {
      textarea.setSelectionRange(caret, caret);
    }
  };

  // changes focus of the cursor/caret
  // uses useCallback to memoize the function
  // takes a pageID of the page to focus on
  // takes the caret position it should be in when focussed on the page
  const focusPage = useCallback((pageId, caret = null) => {
    const textarea = textareaRefs.current.get(pageId);

    //if text area exists
    if (textarea) {
      placeCaret(textarea, caret);
    // if the text area does not exist yet put the page and caret into the pendingFocus object
    } else {
      pendingFocus.current = { id: pageId, caret };
    }
  }, []);

  //registerTextarea function takes 2 parameters and uses useCallback to be memoized
  //id is the id of the page object that is to register its text area
  //element is the text area iteself
  const registerTextarea = useCallback((id, element) => {
    if (element) {
      textareaRefs.current.set(id, element);

      if (pendingFocus.current?.id === id) {
        placeCaret(element, pendingFocus.current.caret);
        pendingFocus.current = null;
      }
    } else {
      textareaRefs.current.delete(id);
    }
  }, []);


  // function to handle writing in a text area
  // takes the id of the page
  // takes the alteration (new text string in the text area)
  const writing = useCallback((id, alteration) => {
    setPages((currentPages) => {
      const pageIndex = currentPages.findIndex((page) => page.id === id);
      if (pageIndex === -1){
        console.log('Page with this page ID was not found');
        return currentPages;
      }

      // a reflow that moves nothing must not schedule another render, or
      // measuring and writing would feed each other forever
      if (currentPages[pageIndex].text === alteration) {
        return currentPages;
      }

      return currentPages.map((page, index) =>
        index === pageIndex ? { ...page, text: alteration } : page
      );
    });
  }, []);

  // Writing to excess writes to the producing page's excess slot
  // it takes the page index, the excess text and the caret()
  // The caret rides along with the excess because only the receiving page
  // knows when the text has landed and where the offset ends up.
  const writingToExcess = useCallback((pageIndex, excess, caret = null) => {
    if (pageIndex < 0) return;

    setPages((currentPages) => {
      if (pageIndex >= currentPages.length) return currentPages;

      const current = currentPages[pageIndex].excess;
      const nextExcess = excess === '' ? [''] : [excess, caret];
      if (current[0] === nextExcess[0] && (current[1] ?? null) === (nextExcess[1] ?? null)) {
        return currentPages;
      }

      return currentPages.map((page, index) =>
        index === pageIndex ? { ...page, excess: nextExcess } : page
      );
    });
  }, []);


  //Create page function
  //returns the id of the newly created page
  const createPage = useCallback(() => {
    const nextPageID = crypto.randomUUID();
    setPages((currentPages) => [
      ...currentPages,
      { id: nextPageID, text: '', excess: [''] },
    ]);
    return nextPageID;
  }, []);
  // remove page function
  // takes in the id of the page to be removed

  const removePage = (id) => {
    let previousPage = null;
    setPages((currentPages) => {
      const pageIndex = currentPages.findIndex((page) => page.id === id);
      if (pageIndex === -1) return currentPages;

      previousPage = currentPages[pageIndex - 1] ?? null;
      return currentPages.filter((page) => page.id !== id);
    });

    //move the focus back to the previous page
    if (previousPage) {
      focusPage(previousPage.id, previousPage.text.length);
    }
  };

  return (
    <div className="pages">
      <h2 className='task2'>Have the question here</h2>
      {pages.map((page, pageIndex) => {
        return <Page
          key={page.id}
          id={page.id}
          registerTextarea={registerTextarea}
          pageNumber={pageIndex + 1}
          removePage={removePage}
          pageText={page.text}
          bottomPage={pageIndex === pages.length - 1}
          previousPageExcess={pages[pageIndex - 1]?.excess}
          nextPageText = {pages[pageIndex + 1]?.text}
          nextPageID = {pages[pageIndex + 1]?.id}
          writingToExcess={writingToExcess}
          writing={writing}
          createPage={createPage}
        />
      })}
    </div>
  );
};

export default Pages;
