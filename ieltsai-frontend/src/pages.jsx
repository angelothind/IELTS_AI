import { useState } from 'react';
import './pages.css';
import Page from './page';

const Pages = () => {
  const [text, setText] = useState('');

  return (
    <div className="pages">
      <Page
        value={text}
        onChange={setText}
      />
    </div>
  );
};

export default Pages;