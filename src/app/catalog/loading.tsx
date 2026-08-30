export default function CatalogLoading() {
  return (
    <main className="container page">
      <div className="skeleton" style={{ height: 30, width: 160 }} />
      <div className="grid" style={{ marginTop: 20 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="card" style={{ overflow: "hidden" }}>
            <div className="skeleton" style={{ aspectRatio: "4 / 3", borderRadius: 0 }} />
            <div style={{ padding: 14, display: "grid", gap: 8 }}>
              <div className="skeleton" style={{ height: 14, width: "60%" }} />
              <div className="skeleton" style={{ height: 18, width: "40%" }} />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
