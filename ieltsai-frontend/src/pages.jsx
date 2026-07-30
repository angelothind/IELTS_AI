import { useState } from 'react';
import './pages.css';

const Pages = () => {
  const [text, setText] = useState('');

  return (
    <div className="pages">
      <textarea
        className="page-editor"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Start writing..."
        aria-label="Writing editor"
        spellCheck
      />
    </div>
  );
};

export default Pages;