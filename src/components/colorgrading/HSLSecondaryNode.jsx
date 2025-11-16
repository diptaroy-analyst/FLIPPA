import React from "react";

export default function HSLSecondaryNode({ data, onChange }) {
  const handleChange = (key, value) => {
    onChange({ [key]: value });
  };

  const handleRangeChange = (key, index, value) => {
    const newRange = [...data[key]];
    newRange[index] = parseFloat(value);
    onChange({ [key]: newRange });
  };

  return (
    <div className="space-y-3">
      <div className="text-[#A88A86] text-xs font-semibold mb-2">
        TARGET SELECTION
      </div>

      <div>
        <label className="text-[#EAE6E3] text-xs mb-1 block">
          Hue Range: {data.hueRange[0]}° - {data.hueRange[1]}°
        </label>
        <div className="flex gap-2">
          <input
            type="range"
            min="0"
            max="360"
            value={data.hueRange[0]}
            onChange={(e) => handleRangeChange('hueRange', 0, e.target.value)}
            className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
            style={{
              background: 'linear-gradient(to right, red, yellow, green, cyan, blue, magenta, red)'
            }}
          />
          <input
            type="range"
            min="0"
            max="360"
            value={data.hueRange[1]}
            onChange={(e) => handleRangeChange('hueRange', 1, e.target.value)}
            className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
            style={{
              background: 'linear-gradient(to right, red, yellow, green, cyan, blue, magenta, red)'
            }}
          />
        </div>
      </div>

      <div>
        <label className="text-[#EAE6E3] text-xs mb-1 block">
          Saturation Range: {data.saturationRange[0]}% - {data.saturationRange[1]}%
        </label>
        <div className="flex gap-2">
          <input
            type="range"
            min="0"
            max="100"
            value={data.saturationRange[0]}
            onChange={(e) => handleRangeChange('saturationRange', 0, e.target.value)}
            className="flex-1 h-2 bg-[#2B2B2B] rounded-lg appearance-none cursor-pointer"
          />
          <input
            type="range"
            min="0"
            max="100"
            value={data.saturationRange[1]}
            onChange={(e) => handleRangeChange('saturationRange', 1, e.target.value)}
            className="flex-1 h-2 bg-[#2B2B2B] rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      <div>
        <label className="text-[#EAE6E3] text-xs mb-1 block">
          Luminance Range: {data.luminanceRange[0]}% - {data.luminanceRange[1]}%
        </label>
        <div className="flex gap-2">
          <input
            type="range"
            min="0"
            max="100"
            value={data.luminanceRange[0]}
            onChange={(e) => handleRangeChange('luminanceRange', 0, e.target.value)}
            className="flex-1 h-2 bg-[#2B2B2B] rounded-lg appearance-none cursor-pointer"
          />
          <input
            type="range"
            min="0"
            max="100"
            value={data.luminanceRange[1]}
            onChange={(e) => handleRangeChange('luminanceRange', 1, e.target.value)}
            className="flex-1 h-2 bg-[#2B2B2B] rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      <div className="text-[#A88A86] text-xs font-semibold mt-4 mb-2">
        ADJUSTMENTS
      </div>

      <div>
        <label className="text-[#EAE6E3] text-xs mb-1 block">
          Hue Shift: {data.hueShift}°
        </label>
        <input
          type="range"
          min="-180"
          max="180"
          value={data.hueShift}
          onChange={(e) => handleChange('hueShift', e.target.value)}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer"
          style={{
            background: 'linear-gradient(to right, red, yellow, green, cyan, blue, magenta, red)'
          }}
        />
      </div>

      <div>
        <label className="text-[#EAE6E3] text-xs mb-1 block">
          Saturation: {data.saturationAdjust > 0 ? '+' : ''}{data.saturationAdjust}%
        </label>
        <input
          type="range"
          min="-100"
          max="100"
          value={data.saturationAdjust}
          onChange={(e) => handleChange('saturationAdjust', e.target.value)}
          className="w-full h-2 bg-[#2B2B2B] rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <div>
        <label className="text-[#EAE6E3] text-xs mb-1 block">
          Luminance: {data.luminanceAdjust > 0 ? '+' : ''}{data.luminanceAdjust}%
        </label>
        <input
          type="range"
          min="-100"
          max="100"
          value={data.luminanceAdjust}
          onChange={(e) => handleChange('luminanceAdjust', e.target.value)}
          className="w-full h-2 bg-[#2B2B2B] rounded-lg appearance-none cursor-pointer"
        />
      </div>
    </div>
  );
}