import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

export default function AdmitUploader({ onUpload }) {
  const onDrop = useCallback((files) => {
    if (files?.[0]) onUpload?.(files[0]);
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"], "image/*": [".png", ".jpg", ".jpeg"] },
    maxFiles: 1,
  });

  return (
    <div {...getRootProps()} className="glass-card p-10 text-center cursor-pointer border-2 border-dashed" style={{ borderColor: isDragActive ? "#00D4B8" : "rgba(0,212,184,0.2)" }}>
      <input {...getInputProps()} />
      <div className="text-5xl mb-3">{isDragActive ? "📥" : "📤"}</div>
      <div className="text-white font-semibold">{isDragActive ? "Drop the admit letter here" : "Upload admit letter"}</div>
      <div className="text-gray-400 text-sm mt-2">PDF, PNG, JPG</div>
    </div>
  );
}
