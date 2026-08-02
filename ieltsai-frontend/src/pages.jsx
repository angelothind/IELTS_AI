import { useState, useCallback } from 'react';
import './pages.css';
import Page from './page';

const Pages = () => {
  const [documentText, setDocumentText] = useState([['']]);
  const [pages, setPages] = useState([
    { id: crypto.randomUUID(), number: 1, bottomPage: true },
  ]);

  const writing = (id, alteration) => {
    const pageIndex = pages.findIndex((page) => page.id === id);
    if (pageIndex === -1) return;

    setDocumentText((currentDocument) =>
      currentDocument.map((pageText, index) =>
        index === pageIndex ? [alteration] : pageText
      )
    );
  };

  const createPage = useCallback(() => {
    setDocumentText((previousDocumentText) => [...previousDocumentText, ['']]);
    setPages((currentPages) => [
      ...currentPages.map((page) => ({ ...page, bottomPage: false })),
      {
        id: crypto.randomUUID(),
        number: currentPages.length + 1,
        bottomPage: true,
      },
    ]);
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
          pageNumber={page.number}
          removePage={removePage}
          pageText={documentText[pageIndex]}
          bottomPage={page.bottomPage}
          writing={writing}
          createPage={createPage}
        />
      })}
    </div>
  );
};

export default Pages;