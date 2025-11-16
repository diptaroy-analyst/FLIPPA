import React, { useRef, useState, useEffect } from "react";
import { Upload, X, Sliders } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

export default function LUTNode({ value, onChange }) {
  const [lutData, setLutData] = useState(value?.lutData || null);
  const [lutFileName, setLutFileName] = useState(value?.fileName || '');
  const [intensity, setIntensity] = useState(value?.intensity || 100);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (onChange) {
      onChange({
        lutData,
        fileName: lutFileName,
        intensity: intensity
      });
    }
  }, [lutData, lutFileName, intensity]);

  const parseCubeLUT = (text) => {
    const lines = text.split('\n');
    const lut = {
      size: 0,
      data: []
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip comments and empty lines
      if (line.startsWith('#') || line === '') continue;
      
      // Parse LUT_3D_SIZE
      if (line.startsWith('LUT_3D_SIZE')) {
        lut.size = parseInt(line.split(/\s+/)[1]);
        continue;
      }
      
      // Parse RGB values
      const values = line.split(/\s+/).map(v => parseFloat(v));
      if (values.length === 3 && values.every(v => !isNaN(v))) {
        lut.data.push(values);
      }
    }

    return lut;
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.cube')) {
      alert('Please upload a .cube LUT file');
      return;
    }

    try {
      const text = await file.text();
      const parsedLUT = parseCubeLUT(text);
      
      if (parsedLUT.size === 0 || parsedLUT.data.length === 0) {
        alert('Invalid LUT file format');
        return;
      }

      setLutData(parsedLUT);
      setLutFileName(file.name);
    } catch (error) {
      console.error('Error parsing LUT:', error);
      alert('Failed to parse LUT file');
    }
  };

  const handleRemoveLUT = () => {
    setLutData(null);
    setLutFileName('');
    setIntensity(100);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-white">LUT File</span>
        {lutData && (
          <Button
            onClick={handleRemoveLUT}
            variant="ghost"
            size="sm"
            className="text-red-400 hover:text-red-300"
          >
            <X className="w-4 h-4 mr-1" />
            Remove
          </Button>
        )}
      </div>

      {!lutData ? (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".cube"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="w-full border-white/20 text-white hover:bg-white/10"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload .cube LUT
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
            <div className="text-green-400 text-sm font-semibold mb-1">LUT Loaded</div>
            <div className="text-white text-xs truncate">{lutFileName}</div>
            <div className="text-gray-400 text-xs mt-1">
              Size: {lutData.size}³ ({lutData.data.length} entries)
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white flex items-center gap-2">
                <Sliders className="w-4 h-4" />
                Intensity
              </span>
              <span className="text-sm text-[#A88A86] font-semibold">{intensity}%</span>
            </div>
            <Slider
              value={[intensity]}
              onValueChange={(val) => setIntensity(val[0])}
              min={0}
              max={100}
              step={1}
              className="[&_[role=slider]]:bg-[#A88A86] [&_[role=slider]]:border-[#A88A86]"
            />
          </div>

          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 text-xs text-blue-300">
            <div className="font-semibold mb-1">✓ Real-time Preview Active</div>
            <div className="text-blue-200">
              LUT is being applied to video/image preview in real-time. Adjust intensity to see the effect.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}