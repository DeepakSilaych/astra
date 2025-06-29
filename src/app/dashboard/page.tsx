"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import ImageUpload from "../../components/ImageUpload";
import { useIsMounted } from "../../utils/clientOnly";

export default function Dashboard() {
  const isMounted = useIsMounted();
  const [prompt, setPrompt] = useState("");
  const [sizingInfo, setSizingInfo] = useState("");
  const [referenceImages, setReferenceImages] = useState<
    Array<{ file: string; url?: string; name: string; type: string }>
  >([]);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<string>("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [jobHistory, setJobHistory] = useState<
    Array<{
      id: string;
      status: string;
      data?: { description?: string };
      createdAt: string;
      completedAt?: string;
      result?: { generatedImageUrl?: string };
    }>
  >([]);

  // Initialize session on component mount
  useEffect(() => {
    const initSession = async () => {
      try {
        // Check if we have a session in localStorage
        let storedSessionId = localStorage.getItem("astra-session-id");

        if (!storedSessionId) {
          // Create new session
          const response = await fetch("/api/sessions", {
            method: "POST",
          });

          if (response.ok) {
            const { sessionId: newSessionId } = await response.json();
            storedSessionId = newSessionId;
            localStorage.setItem("astra-session-id", newSessionId);
          }
        }

        setSessionId(storedSessionId);
        if (storedSessionId) {
          loadSessionHistory(storedSessionId);
        }
      } catch (error) {
        console.error("Error initializing session:", error);
      }
    };

    if (isMounted) {
      initSession();
    }
  }, [isMounted]);

  const loadSessionHistory = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/queue?sessionId=${sessionId}`);
      if (response.ok) {
        const { jobs } = await response.json();
        setJobHistory(jobs || []);
      }
    } catch (error) {
      console.error("Error loading session history:", error);
    }
  };

  const handleImageUpload = (
    file: File,
    uploadedUrl: string | undefined,
    type: "model" | "jewelry"
  ) => {
    if (uploadedUrl && isMounted) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const newImage = {
            file: e.target.result as string,
            url: uploadedUrl,
            name: file.name,
            type: type,
          };
          setReferenceImages((prev) => [...prev, newImage]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    setReferenceImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (!prompt || !sessionId) return;
    setLoading(true);
    setGenerationStatus("Adding to processing queue...");

    try {
      const modelImage = referenceImages.find(
        (img) => img.type === "model"
      )?.url;
      const jewelryImage = referenceImages.find(
        (img) => img.type === "jewelry"
      )?.url;

      const generateData = {
        description: prompt,
        modelImage,
        jewelryImage,
        sizing: sizingInfo ? parseFloat(sizingInfo) : undefined,
        sessionId,
      };

      // Submit to queue
      const response = await fetch("/api/queue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(generateData),
      });

      if (response.ok) {
        const result = await response.json();
        setGenerationStatus("Queued for processing...");
        pollJobStatus(result.jobId);
        // Refresh job history
        loadSessionHistory(sessionId);
      } else {
        const error = await response.json();
        setGenerationStatus(`Failed to queue job: ${error.error}`);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error queuing job:", error);
      setGenerationStatus("Failed to queue job - network error");
      setLoading(false);
    }
  };

  const pollJobStatus = async (jobId: string) => {
    let attempts = 0;
    const maxAttempts = 120; // 10 minutes max

    const poll = async () => {
      try {
        const response = await fetch(`/api/queue?id=${jobId}`);
        if (response.ok) {
          const job = await response.json();

          switch (job.status) {
            case "pending":
              setGenerationStatus("Waiting in queue...");
              break;
            case "processing":
              setGenerationStatus("Processing with AI...");
              break;
            case "completed":
              if (job.result?.generatedImageUrl) {
                setGeneratedImage(job.result.generatedImageUrl);
                setGenerationStatus("");
                setLoading(false);
                // Refresh job history
                if (sessionId) loadSessionHistory(sessionId);
                return;
              }
              break;
            case "failed":
              setGenerationStatus(`Generation failed: ${job.error}`);
              setLoading(false);
              // Refresh job history
              if (sessionId) loadSessionHistory(sessionId);
              return;
          }

          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(poll, 5000); // Poll every 5 seconds
          } else {
            setGenerationStatus("Timeout - job took too long");
            setLoading(false);
          }
        }
      } catch (error) {
        console.error("Error polling job:", error);
        setGenerationStatus("Error checking job status");
        setLoading(false);
      }
    };

    poll();
  };

  const downloadImage = () => {
    if (generatedImage) {
      const link = document.createElement("a");
      link.href = generatedImage;
      link.download = "virtual-tryOn.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">A</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">Astra</span>
          </Link>
          <div className="text-sm text-gray-500">Virtual Jewelry Try-On</div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Compact Input Panel */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Virtual Try-On Setup
                </h2>
              </div>

              {/* Prompt Input */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder='Describe the jewelry and model (e.g., "Diamond necklace on elegant woman")'
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>

              {/* NEW: Sizing Information Field */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Sizing Information
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder='e.g., "16-inch chain length, 2cm pendant diameter"'
                  value={sizingInfo}
                  onChange={(e) => setSizingInfo(e.target.value)}
                />
              </div>

              {/* Image Upload Section */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Reference Images
                </label>
                <div className="flex space-x-2">
                  <ImageUpload
                    onImageUpload={(file, url) =>
                      handleImageUpload(file, url, "model")
                    }
                    label="Model Photo"
                    imageCount={0}
                  />
                  <ImageUpload
                    onImageUpload={(file, url) =>
                      handleImageUpload(file, url, "jewelry")
                    }
                    label="Jewelry"
                    imageCount={0}
                  />
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                className="w-full mt-6 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium px-4 py-3 rounded-lg hover:from-violet-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || !prompt}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm">
                      {generationStatus || "Generating..."}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm">Generate Virtual Try-On</span>
                )}
              </button>
            </div>

            {/* Reference Images Preview */}
            {isMounted && referenceImages.length > 0 && (
              <div
                className="bg-white rounded-xl border border-gray-200 p-4"
                suppressHydrationWarning
              >
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Uploaded Images ({referenceImages.length})
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {referenceImages.map((img, index) => (
                    <div
                      key={`ref-${index}-${img.name}`}
                      className="relative group"
                    >
                      <Image
                        src={img.file}
                        alt={`Reference ${index + 1}`}
                        width={120}
                        height={90}
                        className="rounded-lg w-full h-20 object-cover"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                      <div className="mt-1 text-xs text-gray-500 truncate">
                        {img.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Result Display */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6 h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Generated Result
                  </h2>
                </div>
                {generatedImage && (
                  <div className="flex space-x-2">
                    <button
                      onClick={downloadImage}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                    >
                      Download
                    </button>
                    <button className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                      Share
                    </button>
                  </div>
                )}
              </div>

              <div
                className="relative rounded-xl bg-gray-50 border border-gray-100 overflow-hidden"
                style={{ aspectRatio: "16/10" }}
                suppressHydrationWarning
              >
                {generatedImage ? (
                  <Image
                    src={generatedImage}
                    alt="Virtual Try-On Result"
                    fill
                    className="object-contain"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                    <svg
                      className="w-16 h-16 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-sm">
                      Your virtual try-on image will appear here
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Upload images and add description to get started
                    </p>
                  </div>
                )}

                {loading && (
                  <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto mb-3"></div>
                      <p className="text-sm text-gray-600">
                        {generationStatus || "Processing..."}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
                <div className="flex items-center space-x-4">
                  <span>💡 Tip: Add sizing details for better accuracy</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  <span>AI Ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Job History */}
        {jobHistory.length > 0 && (
          <div className="mt-6 bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Try-Ons
              </h3>
              <p className="text-sm text-gray-500 mt-1">Your session history</p>
            </div>
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {jobHistory.slice(0, 10).map((job) => (
                <div key={job.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            job.status === "completed"
                              ? "bg-green-500"
                              : job.status === "failed"
                              ? "bg-red-500"
                              : job.status === "processing"
                              ? "bg-yellow-500"
                              : "bg-gray-400"
                          }`}
                        ></div>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {job.data?.description || "Untitled try-on"}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                        <span>
                          {new Date(job.createdAt).toLocaleTimeString()}
                        </span>
                        <span className="capitalize">{job.status}</span>
                        {job.completedAt && (
                          <span>
                            {Math.round(
                              (new Date(job.completedAt).getTime() -
                                new Date(job.createdAt).getTime()) /
                                1000
                            )}
                            s
                          </span>
                        )}
                      </div>
                    </div>
                    {job.status === "completed" &&
                      job.result?.generatedImageUrl && (
                        <button
                          onClick={() =>
                            setGeneratedImage(job.result!.generatedImageUrl!)
                          }
                          className="ml-4 px-3 py-1.5 bg-violet-100 text-violet-700 rounded-lg text-xs hover:bg-violet-200 transition-colors"
                        >
                          View
                        </button>
                      )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Tips */}
        <div className="mt-6 bg-gradient-to-r from-violet-50 to-indigo-50 rounded-xl p-4 border border-violet-200">
          <div className="flex items-start space-x-3">
            <svg
              className="w-5 h-5 text-violet-600 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-violet-900 mb-1">
                Pro Tips for Best Results
              </h3>
              <ul className="text-xs text-violet-700 space-y-1">
                <li>
                  • Upload high-quality, well-lit photos with clear neck/ear
                  areas
                </li>
                <li>
                  • Include specific sizing details (chain length, pendant size,
                  ring size, etc.)
                </li>
                <li>
                  • Describe jewelry material and style (gold, silver, diamond,
                  vintage, modern)
                </li>
                <li>
                  • For earrings, ensure ears are visible and hair is styled
                  away
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
