import { useState } from 'react';
import { api } from '../api.js';
import { triggerDownload } from '../utils.js';

export default function ImportPage() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [downloading, setDownloading] = useState(false);

  async function handleTemplate() {
    setError(''); setDownloading(true);
    try {
      const { blob, filename } = await api.importTemplate();
      triggerDownload(blob, filename || 'member-import-template.xlsx');
    } catch (err) {
      setError(err.message);
    } finally {
      setDownloading(false);
    }
  }

  function handleFile(e) {
    setError(''); setResult(null);
    const picked = e.target.files?.[0] || null;
    // Reset the input so re-picking the SAME filename (after fixing rows in
    // Excel) fires change again — Chrome/Safari otherwise keep the stale file.
    e.target.value = '';
    if (picked && picked.size > 10 * 1024 * 1024) {
      setFile(null);
      setError('That file is too large to upload (limit 10 MB).');
      return;
    }
    setFile(picked);
  }

  async function handleUpload() {
    if (!file) return;
    setBusy(true); setError(''); setResult(null);
    try {
      setResult(await api.importMembersExcel(file));
      // Disarm the button — importing the same sheet twice would try to
      // duplicate every member. Re-importing means re-choosing the file.
      setFile(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <span className="eyebrow">Bulk Sign-ups</span>
      <div className="section-head" style={{ margin: '8px 0 18px' }}>
        <h2>Import Members</h2>
      </div>

      {error && <div className="notice error">{error}</div>}
      {result && (
        <div className={`notice ${result.failed ? 'error' : 'ok'}`}>
          Received {result.received}. Added {result.inserted}. Failed {result.failed}.
          {result.errors?.length > 0 && (
            <ul style={{ margin: '8px 0 0' }}>
              {result.errors.slice(0, 50).map((e) => <li key={e.row}>Row {e.row}: {e.reason}</li>)}
              {result.errors.length > 50 && <li>…and {result.errors.length - 50} more rows.</li>}
            </ul>
          )}
        </div>
      )}

      <div className="card">
        <span className="eyebrow">Step 1 — Get the template</span>
        <p className="muted" style={{ margin: '10px 0 12px' }}>
          Download the sample Excel file and fill one member per row on the <b>Members</b> sheet.
          The <b>Example</b> sheet shows a filled row, and the <b>Packages</b> sheet lists the
          plans you can put in the Package column (by name or ID). Leave the membership number
          blank to auto-assign one; leave Amount Paid blank to record the full plan price.
        </p>
        <button className="btn ghost" onClick={handleTemplate} disabled={downloading}>
          {downloading ? 'Preparing…' : 'Download sample Excel'}
        </button>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <span className="eyebrow">Step 2 — Upload the filled file</span>
        <p className="muted" style={{ margin: '10px 0 0' }}>
          Each row is imported on its own: a problem row is skipped and reported with its row
          number, and the rest still import. Rows with a Package also get their membership
          period and a payment receipt.
        </p>
        <div className="field" style={{ marginTop: 12 }}>
          <label>Excel file (.xlsx)</label>
          <input
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={handleFile}
          />
        </div>

        {file && <p>Ready to import <b>{file.name}</b>.</p>}

        <button className="btn brass" onClick={handleUpload} disabled={!file || busy}>
          {busy ? 'Importing…' : 'Import into database'}
        </button>
      </div>
    </>
  );
}
