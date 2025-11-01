import React, { useState, useEffect } from "react";

interface Video {
  name: string;
  url: string;
}

const HomePage: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Fetch all homepage data (videos only for now)
  const fetchHome = async () => {
    try {
      const res = await fetch("http://localhost:8080/");
      if (!res.ok) throw new Error("Failed to load videos");
      const data = await res.json();
      const videosWithFullURL = (data.videos || []).map((v: Video) => ({
  ...v,
  url: `http://localhost:8080${v.url}`,
}));
setVideos(videosWithFullURL);
    } catch (err) {
      console.error(err);
    }
  };

  // Upload a video then reload the list
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/videos", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      setFile(null);
      await fetchHome(); // refresh list immediately
    } catch (err) {
      console.error(err);
      alert("Upload failed. See console for details.");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    fetchHome();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6 text-center">
        🎬 MedApp — Public Homepage
      </h1>

      <form
        onSubmit={handleUpload}
        className="mb-6 flex flex-wrap gap-2 justify-center"
      >
        <input
          type="file"
          accept="video/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="border p-2 rounded"
          disabled={uploading}
        />
        <button
          type="submit"
          disabled={!file || uploading}
          className={`px-4 py-2 rounded text-white ${
            uploading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-6xl">
        {videos.length === 0 ? (
          <p className="text-gray-500 text-center w-full">
            No videos uploaded yet.
          </p>
        ) : (
          videos.map((v) => (
            <div
              key={v.url}
              className="bg-white rounded-lg shadow p-2 transition-transform hover:scale-[1.01]"
            >
              <video
                src={v.url}
                controls
                className="w-full rounded-md"
                preload="metadata"
              />
              <p className="text-center mt-2 text-gray-700 truncate">
                {v.name}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HomePage;
