import { useState, useCallback, useRef } from 'react';
import './pages.css';
import Page from './page';

const Pages = () => {
  const [documentText, setDocumentText] = useState([['']]);
  const [pages, setPages] = useState([
    { id: crypto.randomUUID(), number: 1, bottomPage: true },
  ]);
  const textareaRefs = useRef(new Map());
  const pendingFocusId = useRef(null);

  const registerTextarea = useCallback((id, element) => {
    if (element) {
      textareaRefs.current.set(id, element);

      if (pendingFocusId.current === id) {
        element.focus();
        pendingFocusId.current = null;
      }
    } else {
      textareaRefs.current.delete(id);
    }
  }, []);

  const focusPage = useCallback((pageId) => {
    const textarea = textareaRefs.current.get(pageId);

    if (textarea) {
      textarea.focus();
    } else {
      pendingFocusId.current = pageId;
    }
  }, []);

  const writing = (id, alteration) => {
    const pageIndex = pages.findIndex((page) => page.id === id);
    if (pageIndex === -1){
      console.log('Page with this page ID was not found');
      return;
    }

    setDocumentText((currentDocument) =>
      currentDocument.map((pageText, index) =>
        index === pageIndex ? [alteration] : pageText
      )
    );
  };

  const createPage = useCallback(() => {
    const nextPageID = crypto.randomUUID();
    setDocumentText((previousDocumentText) => [...previousDocumentText, ['']]);
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
    setPages((currentPages) => {
      const remainingPages = currentPages.filter((page) => page.id !== id);
      return remainingPages.map((page, index) => ({
        ...page,
        number: index + 1,
        bottomPage: index === remainingPages.length - 1,
      }));
    });
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
          writing={writing}
          focusPage={focusPage}
          createPage={createPage}
        />
      })}
    </div>
  );
};

export default Pages;