import { useState } from 'react';
import './pages.css';
import Page from './page';

const Pages = () => {
  const [documentText, setDocumentText] = useState('');
  const [pages, setPages] = useState([{id: crypto.randomUUID(), number: 1, text: '', topPage: true}]);
  const createPage = () => {
    setPages((currentPages) => [
      ...currentPages.map((page) => ({ ...page, topPage: false })),
      {id: crypto.randomUUID(), number: currentPages.length + 1, text: '', topPage: true},
    ]);
  };

  return (
    <div className="pages">
      {pages.map((page) => {
        return <Page 
        key={page.id}
        id={page.id} 
        pageNumber={page.number}
        text={page.text} 
        topPage={page.topPage}
        onChange={setDocumentText}
        createPage={createPage}
        />})}
    </div>
  );
};

export default Pages;