export default function ProductLoading() {
  return (
    <main className="container page">
      <div className="card" style={{ overflow: "hidden", maxWidth: 860 }}>
        <div className="skeleton" style={{ aspectRatio: "16 / 6", borderRadius: 0 }} />
        <div style={{ padding: 20, display: "grid", gap: 12 }}>
          <div className="skeleton" style={{ height: 26, width: "50%" }} />
          <div className="skeleton" style={{ height: 24, width: 120 }} />
          <div className="skeleton" style={{ height: 60, width: "100%" }} />
          <div className="skeleton" style={{ height: 44, width: 200 }} />
        </div>
      </div>
    </main>
  );
}
