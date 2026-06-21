import { useState } from 'react';

const stripTags = (s) => s.replace(/<[^>]*>/g, '').trim();

function parseResponse(data) {
  const he = data.he;
  if (!he || !he.length) return null;

  if (Array.isArray(he[0])) {
    // multi-chapter: he = [[v1,v2,...], [v1,v2,...], ...]
    const startChap = Array.isArray(data.sections) ? data.sections[0] : 1;
    return he.map((chap, i) => ({
      chapterNum: startChap + i,
      verses: chap.filter((v) => v && stripTags(v)),
      startVerse: 1,
    }));
  }

  // single chapter or verse range: he = [v1, v2, ...]
  const startVerse =
    Array.isArray(data.sections) && data.sections.length >= 2
      ? data.sections[1]
      : 1;
  return [{
    chapterNum: Array.isArray(data.sections) ? data.sections[0] : null,
    verses: he.filter((v) => v && stripTags(v)),
    startVerse,
  }];
}

function TextViewer({ sefariaRef, fallbackLabel = 'Sefaria.org' }) {
  const [open,     setOpen]     = useState(false);
  const [sections, setSections] = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(false);

  const toggle = async () => {
    if (open) { setOpen(false); return; }
    setOpen(true);
    if (sections || error) return;
    setLoading(true);
    setError(false);
    try {
      const url =
        `https://www.sefaria.org/api/texts/${encodeURIComponent(sefariaRef)}` +
        `?lang=he&context=0&sheets=0`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('http');
      const data = await res.json();
      const parsed = parseResponse(data);
      if (!parsed || !parsed.length) throw new Error('empty');
      setSections(parsed);
    } catch {
      setError(true);
    }
    setLoading(false);
  };

  const fallbackUrl = `https://www.sefaria.org/${encodeURIComponent(sefariaRef)}?lang=he`;

  return (
    <div className="text-viewer">
      <button className="text-viewer-btn" onClick={toggle}>
        {open ? '▲ סגור' : '📖 קרא עכשיו'}
      </button>

      {open && (
        <div className="text-viewer-panel">
          {loading && (
            <p className="text-viewer-status">⏳ טוען מ-Sefaria.org...</p>
          )}

          {error && (
            <p className="text-viewer-status">
              לא ניתן לטעון כעת.{' '}
              <a href={fallbackUrl} target="_blank" rel="noreferrer" className="text-viewer-link">
                פתח ב-{fallbackLabel} ↗
              </a>
            </p>
          )}

          {sections && sections.map((sec, si) => (
            <div key={si} className="text-section">
              {sections.length > 1 && (
                <p className="text-section-head">פרק {sec.chapterNum}</p>
              )}
              {sec.verses.map((v, vi) => (
                <p key={vi} className="text-verse">
                  <span className="verse-num">{sec.startVerse + vi}</span>
                  {/* eslint-disable-next-line react/no-danger */}
                  <span dangerouslySetInnerHTML={{ __html: v }} />
                </p>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TextViewer;
