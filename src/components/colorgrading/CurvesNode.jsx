import React from "react";
import { Input } from "@/components/ui/input";

export default function CurvesNode({ data, onChange }) {
  const channels = ['master', 'red', 'green', 'blue'];
  
  const handleChannelChange = (channel) => {
    onChange({ activeChannel: channel });
  };

  const handleCurveAdjust = (value) => {
    // Simple curve adjustment - shift all values
    const curve = data[data.activeChannel].map((point, i) => ({
      x: point.x,
      y: Math.max(0, Math.min(255, point.y + parseFloat(value)))
    }));
    onChange({ [data.activeChannel]: curve });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-1">
        {channels.map(channel => (
          <button
            key={channel}
            onClick={() => handleChannelChange(channel)}
            className={`px-2 py-1 text-xs font-semibold rounded transition-colors ${
              data.activeChannel === channel
                ? 'bg-[#A88A86] text-black'
                : 'bg-[#2B2B2B] text-[#EAE6E3] hover:bg-[#4A4A4A]'
            }`}
          >
            {channel.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="bg-[#2B2B2B] rounded p-3">
        <div className="w-full h-32 bg-[#1E1E1E] rounded relative overflow-hidden">
          <svg width="100%" height="100%" viewBox="0 0 256 256" className="transform scale-y-[-1]">
            {/* Grid */}
            <g stroke="#4A4A4A" strokeWidth="1">
              <line x1="0" y1="64" x2="256" y2="64" />
              <line x1="0" y1="128" x2="256" y2="128" />
              <line x1="0" y1="192" x2="256" y2="192" />
              <line x1="64" y1="0" x2="64" y2="256" />
              <line x1="128" y1="0" x2="128" y2="256" />
              <line x1="192" y1="0" x2="192" y2="256" />
            </g>
            
            {/* Curve line */}
            <polyline
              points={data[data.activeChannel].map(p => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke={
                data.activeChannel === 'red' ? '#ff0000' :
                data.activeChannel === 'green' ? '#00ff00' :
                data.activeChannel === 'blue' ? '#0000ff' :
                '#A88A86'
              }
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>

      <div>
        <label className="text-[#A88A86] text-xs font-semibold mb-1 block">
          Adjust {data.activeChannel} curve:
        </label>
        <input
          type="range"
          min="-50"
          max="50"
          defaultValue="0"
          onChange={(e) => handleCurveAdjust(e.target.value)}
          className="w-full h-2 bg-[#2B2B2B] rounded-lg appearance-none cursor-pointer"
        />
      </div>
    </div>
  );
}