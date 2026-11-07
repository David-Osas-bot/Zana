export function LoadingState() {
  return (
    <div className="content">
      <div className="skeleton" style={{ height: 55, width: 290, marginBottom: 45 }} />
      <div className="stats">
        {[1, 2, 3, 4].map(i => (
          <div className="stat" key={i}>
            <div className="skeleton" style={{ height: 36, width: 70 }} />
            <div className="skeleton" style={{ height: 11, width: 100, marginTop: 12 }} />
          </div>
        ))}
      </div>
      <div className="project-grid">
        {[1, 2, 3].map(i => <div className="skeleton" style={{ height: 183 }} key={i} />)}
      </div>
    </div>
  );
}
