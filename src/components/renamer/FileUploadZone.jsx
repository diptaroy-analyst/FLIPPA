import React, { useState, useRef } from "react";
import { Upload, FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FileUploadZone({ onFilesAdded, compact }) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesAdded(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesAdded(e.target.files);
    }
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  if (compact) {
    return (
      <div className="bg-[#2B2B2B] rounded-xl shadow-lg p-4">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileInput}
          className="hidden"
        />
        <Button variant="outline" className="w-full gap-2 bg-[#A88A86] hover:bg-[#9A7A76] text-black border-0" onClick={openFilePicker}>
          <Upload className="w-4 h-4" />
          Add More Files
        </Button>
      </div>
    );
  }

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`relative border-3 border-dashed rounded-3xl transition-all duration-300 ${
        dragActive
          ? "border-[#A88A86] bg-[#2B2B2B] scale-105"
          : "border-gray-600 bg-[#2B2B2B] hover:border-[#A88A86]"
      }`}
      style={{ fontFamily: 'Urbanist, sans-serif' }}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileInput}
        className="hidden"
      />
      <div className="cursor-pointer block p-12 md:p-20 text-center" onClick={openFilePicker}>
        <div className="flex flex-col items-center gap-4">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
            dragActive 
              ? "bg-[#3A3A3A] scale-110" 
              : "bg-[#3A3A3A]"
          }`}>
            <FileUp className={`w-12 h-12 transition-colors duration-300 ${
              dragActive ? "text-[#A88A86]" : "text-[#A88A86]"
            }`} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[#EAE6E3] mb-2">
              Drop your files here
            </h3>
            <p className="text-[#A88A86] mb-4">
              or click to browse from your computer
            </p>
            <Button className="bg-[#A88A86] hover:bg-[#9A7A76] text-black font-semibold">
              <Upload className="w-4 h-4 mr-2" />
              Choose Files
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}