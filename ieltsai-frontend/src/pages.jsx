import { useState, useEffect } from 'react';
import './pages.css';
import Page from './page';

const Pages = () => {
  const [documentText, setDocumentText] = useState('');
  const [pages, setPages] = useState([{id: crypto.randomUUID(), number: 1, text: '', topPage: true}]);
  const [pageToRemove, setPageToRemove] = useState(null);
  const createPage = () => {
    setPages((currentPages) => [
      ...currentPages.map((page) => ({ ...page, topPage: false })),
      {id: crypto.randomUUID(), number: currentPages.length + 1, text: '', topPage: true},
    ]);
  };
  const removePage = (id) =>{
    setPages((currentPages) => {
      const nonEmptyPages = currentPages.filter((page) => page.id !== id); nonEmptyPages.at(-1).topPage}),[pageToRemove]}
        

  useEffect( () => {removePage(pageToRemove),[pageToRemove]; setPageToRemove(null);}, [pageToRemove]);

  return (
    <div className="pages">
      {pages.map((page) => {
        return <Page 
        key={page.id}
        id={page.id} 
        pageNumber={page.number}
        setPageToRemove ={setPageToRemove}
        text={page.text} 
        topPage={page.topPage}
        onChange={setDocumentText}
        createPage={createPage}
        />})}
    </div>
  );
};

export default Pages;