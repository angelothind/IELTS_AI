import { useState, useCallback, useRef } from 'react';
import './pages.css';
import Page from './page';

const Pages = () => {
  const [documentText, setDocumentText] = useState([['']]);
  const [pageExcess, setPageExcess] = useState([['']]);
  const [pages, setPages] = useState([
    { id: crypto.randomUUID(), number: 1, bottomPage: true },
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
    const pageIndex = pages.findIndex((page) => page.id === id);
    if (pageIndex === -1){
      console.log('Page with this page ID was not found');
      return;
    }

    setDocumentText((currentDocument) =>
      // a reflow that moves nothing must not schedule another render, or
      // measuring and writing would feed each other forever
      currentDocument[pageIndex]?.[0] === alteration
        ? currentDocument
        : currentDocument.map((pageText, index) =>
            index === pageIndex ? [alteration] : pageText
          )
    );
  }, [pages]);

  // Writing to excess writes to the excess array 
  // in the index of the page that is creating the excess
  // it taes the page index, the excess text and the caret()
  // The caret rides along with the excess because only the receiving page
  // knows when the text has landed and where the offset ends up.
  // returns the currentBuffer with the new excess text and the associated caret
  const writingToExcess = useCallback((pageIndex, excess, caret = null) => {
    setPageExcess((currentBuffer) => {
      const current = currentBuffer[pageIndex];
      if (current && current[0] === excess && (current[1] ?? null) === caret) {
        return currentBuffer;
      }
      
      return currentBuffer.map((excessBuffer, index) =>
        index === pageIndex ? [excess, caret] : excessBuffer
      );
    });
  }, []);


  //Create page function
  //returns the id of the newly created page
  const createPage = useCallback(() => {
    const nextPageID = crypto.randomUUID();
    setDocumentText((previousDocumentText) => [...previousDocumentText, ['']]);
    setPageExcess((previousExcess) => [...previousExcess, ['']])
    setPages((currentPages) => [
      ...currentPages.map((page) => ({ ...page, bottomPage: false })),
      {
        id: nextPageID,
        number: currentPages.length + 1,
        bottomPage: true,
      },
    ]); return nextPageID;
  }, []);
  // remove page function
  // takes in the id of the page to be removed

  const removePage = (id) => {
    const pageIndex = pages.findIndex((page) => page.id === id);
    if (pageIndex === -1) return;

    //keep the document text that does not have page index related to the provided id parameter
    setDocumentText((previousDocumentText) =>
      previousDocumentText.filter((_, index) => index !== pageIndex)
    );
    //keep the buffers that do not have page index related to the provided id parameter
    setPageExcess((previousExcess) =>
      previousExcess.filter((_, index) => index !== pageIndex)
    );
    //keep the page objects that are not the ones with the given parameter id
    setPages((currentPages) => {
      const remainingPages = currentPages.filter((page) => page.id !== id);
      return remainingPages.map((page, index) => ({
        ...page,
        number: index + 1,
        bottomPage: index === remainingPages.length - 1,
      }));
    });

    //move the focus back to the previous page
    const previousPage = pages[pageIndex - 1];
    if (previousPage) {
      focusPage(previousPage.id, (documentText[pageIndex - 1]?.[0] ?? '').length);
    }
  };

  return (
    <div className="pages">
      {pages.map((page, pageIndex) => {
        return <Page
          key={page.id}
          id={page.id}
          registerTextarea={registerTextarea}
          pageNumber={page.number}
          removePage={removePage}
          pageText={documentText[pageIndex]}
          bottomPage={page.bottomPage}
          previousPageExcess = {pageExcess[pageIndex -1 ]}
          writingToExcess={writingToExcess}
          writing={writing}
          createPage={createPage}
        />
      })}
    </div>
  );
};

export default Pages;