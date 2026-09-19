// Reusable table pagination footer. Purely presentational: the parent owns the
// current page and slices its own rows, then tells us the page/size/total so we
// can render the range summary and Prev/Next. Renders nothing for a single page.
export default function Pagination({ page, pageSize, total, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  return (
    <div className="pagination">
      <span className="muted">Showing {from}–{to} of {total}</span>
      <div className="pagination-controls">
        <button type="button" className="btn ghost sm" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>← Prev</button>
        <span className="muted">Page {page} / {totalPages}</span>
        <button type="button" className="btn ghost sm" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>Next →</button>
      </div>
    </div>
  );
}
