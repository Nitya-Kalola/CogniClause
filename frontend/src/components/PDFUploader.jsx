import React, { useState } from "react";

export default function PDFUploader() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a PDF file to upload.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${BASE_URL}/contracts/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error("Upload error:", err);
      setError("Upload failed. Check backend connection or file format.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">Upload and Evaluate PDF Contract</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          className="block w-full text-gray-700 border rounded p-2"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Analyzing..." : "Upload & Evaluate"}
        </button>
      </form>

      {error && <div className="text-red-500 mt-4">{error}</div>}

      {result && (
        <div className="mt-6 bg-gray-50 p-4 rounded">
          <h3 className="text-lg font-semibold mb-2">Analysis Result</h3>
          <p className="text-sm text-gray-600 mb-2">
            <strong>Filename:</strong> {result.filename}
          </p>
          <p className="text-sm text-gray-600 mb-2">
            <strong>Extracted Preview:</strong> {result.extracted_text_preview.slice(0, 300)}...
          </p>
          <div className="mt-3">
            <strong>Average Risk Score:</strong> {result.analysis.average_risk_score}
          </div>
          {result.analysis.details && result.analysis.details.length > 0 && (
            <div className="mt-4 space-y-2">
              {result.analysis.details.map((d, i) => (
                <div key={i} className="border rounded p-3 bg-white">
                  <div><strong>Sentence:</strong> {d.sentence}</div>
                  <div><strong>Risk Level:</strong> {d.risk_level}</div>
                  <div><strong>Similarity:</strong> {d.similarity_score}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
