import './page.css';
import { useCallback, useRef, useLayoutEffect } from 'react';

const WHITESPACE = /\s/;

// pull a break back to the start of the word it lands in, unless that word is
// itself longer than a page and has to be broken somewhere
const wordSafeSplit = (value, index) => {
  if (index <= 0 || index >= value.length) return index;
  if (WHITESPACE.test(value[index]) || WHITESPACE.test(value[index - 1])) return index;

  for (let position = index - 1; position > 0; position -= 1) {
    if (WHITESPACE.test(value[position])) return position + 1;
  }
  return index;
};

// How much of `value` fits is a layout question rather than a character count:
// a single newline can push a whole line off the page. scrollHeight only grows
// as the prefix grows, so the longest prefix that still fits can be found by
// binary search. The textarea is measured in place and put back as it was,
// which is invisible because nothing paints until this returns.
const splitAtOverflow = (textarea, value) => {
  // an unlaid-out page measures as overflowing at every length, which would
  // hand a single character to each of an endless run of new pages
  if (textarea.clientHeight === 0) return null;

  const original = textarea.value;
  const fits = (candidate) => {
    textarea.value = candidate;
    return textarea.scrollHeight <= textarea.clientHeight;
  };

  if (fits(value)) {
    textarea.value = original;
    return null;
  }

  let low = 0;
  let high = value.length;
  while (low < high) {
    const middle = Math.ceil((low + high) / 2);
    if (fits(value.slice(0, middle))) {
      low = middle;
    } else {
      high = middle - 1;
    }
  }
  textarea.value = original;

  // something always has to move, otherwise a cascade could never drain
  const breakAt = Math.max(wordSafeSplit(value, low), 1);
  return { kept: value.slice(0, breakAt), excess: value.slice(breakAt) };
};

const Page = ({ id, pageNumber, pageText, registerTextarea, writing, bottomPage, createPage, removePage, previousPageExcess, writingToExcess }) => {
  const textareaRef = useRef(null);
  // Rewriting the value drops the browser caret at the end of the text, so the
  // caret has to be captured up front and put back once the value has settled.
  const caretRef = useRef(null);
  const text = pageText[0];

  // The single way this page's text changes: anything that no longer fits is
  // handed down, and the caret travels with the text it happens to sit in.
  const reflow = useCallback(
    (value, caret, takeFocus = false) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const split = splitAtOverflow(textarea, value);
      const kept = split ? split.kept : value;
      const caretMovesOn = caret !== null && caret > kept.length;

      if (caret !== null) {
        caretRef.current = caretMovesOn ? null : caret;
      }

      writing(id, kept);

      if (split) {
        writingToExcess(
          pageNumber - 1,
          split.excess,
          caretMovesOn ? caret - kept.length : null
        );
        if (bottomPage) createPage();
      }

      if (takeFocus && !caretMovesOn) {
        textarea.focus();
      }
    },
    [bottomPage, createPage, id, pageNumber, writing, writingToExcess]
  );

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // a page can also stop fitting because it got narrower, not just because
    // something was typed into it
    const observer = new ResizeObserver(() => reflow(text, null));
    observer.observe(textarea);
    return () => observer.disconnect();
  }, [reflow, text]);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    const caret = caretRef.current;
    if (caret === null || !textarea || document.activeElement !== textarea) return;

    const position = Math.min(caret, text.length);
    if (textarea.selectionStart !== position || textarea.selectionEnd !== position) {
      textarea.setSelectionRange(position, position);
    }
  }, [text]);

  useLayoutEffect(() => {
    const incoming = previousPageExcess?.[0] ?? '';
    if (incoming === '') return;

    const textarea = textareaRef.current;
    const incomingCaret = previousPageExcess[1] ?? null;
    // text arriving from above shifts a caret that is already on this page
    const caret =
      incomingCaret ??
      (document.activeElement === textarea
        ? textarea.selectionStart + incoming.length
        : null);

    writingToExcess(pageNumber - 2, '');
    reflow(incoming + text, caret, incomingCaret !== null);
  }, [pageNumber, previousPageExcess, reflow, text, writingToExcess]);

  const handleKeyDown = (event) => {
    if (
      // if event = delete, this page is bottom page and its not the first page + is empty
      (event.key === 'Backspace' || event.key === 'Delete') &&
      bottomPage &&
      pageNumber !== 1 &&
      text === ''
    ) {
      event.preventDefault();
      removePage(id);
    }
  };

  const handleEdit = (event) => {
    reflow(event.currentTarget.value, event.currentTarget.selectionStart);
  };

  return (
    <div className="page">
      <textarea
        ref={(element) => {
          textareaRef.current = element;
          registerTextarea(id, element);
        }}
        // pass the ref to the textarea
        className="page-editor"
        // pass the value to the textarea
        value={text}
        // pass the onChange function to the textarea
        onChange={handleEdit}
        onKeyDown={(event) => {handleKeyDown(event)}}
        placeholder="Start writing..."
        aria-label="Writing editor"
      />
    </div>
  );
};

export default Page;
