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

  const placeCaret = (textarea, caret) => {
    textarea.focus();
    if (caret !== null) {
      textarea.setSelectionRange(caret, caret);
    }
  };

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

  const focusPage = useCallback((pageId, caret = null) => {
    const textarea = textareaRefs.current.get(pageId);

    if (textarea) {
      placeCaret(textarea, caret);
    } else {
      pendingFocus.current = { id: pageId, caret };
    }
  }, []);

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

  // The caret rides along with the excess because only the receiving page
  // knows when the text has landed and where the offset ends up.
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

  const removePage = (id) => {
    const pageIndex = pages.findIndex((page) => page.id === id);
    if (pageIndex === -1) return;

    setDocumentText((previousDocumentText) =>
      previousDocumentText.filter((_, index) => index !== pageIndex)
    );
    setPageExcess((previousExcess) =>
      previousExcess.filter((_, index) => index !== pageIndex)
    );
    setPages((currentPages) => {
      const remainingPages = currentPages.filter((page) => page.id !== id);
      return remainingPages.map((page, index) => ({
        ...page,
        number: index + 1,
        bottomPage: index === remainingPages.length - 1,
      }));
    });

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