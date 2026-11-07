export function ErrorState({ retry }: { retry: () => void }) {
  return (
    <div className="content">
      <div className="error">
        <strong>Could not load this workspace.</strong>
        <p>There was a brief interruption. Your work is safe.</p>
        <button className="button secondary" onClick={retry} data-testid="button-retry">Try again</button>
      </div>
    </div>
  );
}
