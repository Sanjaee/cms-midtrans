"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body
        style={{
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: 16,
        }}
      >
        <div>
          <p style={{ fontSize: 72, fontWeight: 700, margin: 0 }}>
            500
          </p>
          <h1 style={{ fontSize: 24 }}>Terjadi Kesalahan</h1>
          <p style={{ color: "#666" }}>
            Maaf, terjadi kesalahan pada server. Silakan coba lagi.
          </p>
          <button
            onClick={() => reset()}
            style={{
              marginTop: 24,
              padding: "12px 28px",
              borderRadius: 8,
              border: "none",
              background: "#18181b",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Coba Lagi
          </button>
        </div>
      </body>
    </html>
  );
}
