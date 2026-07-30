import './page.css';

const Page = ({ value, onChange }) => {
  return (
    <div className="page">
      <textarea
        className="page-editor"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Start writing..."
        aria-label="Writing editor"
        spellCheck
      />
    </div>
  );
};

export default Page;
