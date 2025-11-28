import React from "react";

export default function ColorBalanceNode({ data, onChange }) {
  const ranges = ['shadows', 'midtones', 'highlights'];
  const channels = [
    { name: 'cyan', opposite: 'red', color: '#00FFFF' },
    { name: 'magenta', opposite: 'green', color: '#FF00FF' },
    { name: 'yellow', opposite: 'blue', color: '#FFFF00' }
  ];

  const handleChange = (range, channel, value) => {
    onChange({
      [range]: {
        ...data[range],
        [channel]: parseFloat(value)
      }
    });
  };

  return (
    <div className="space-y-4">
      {ranges.map(range => (
        <div key={range} className="space-y-2">
          <div className="text-[#A88A86] text-xs font-semibold uppercase">
            {range}
          </div>
          {channels.map(channel => (
            <div key={channel.name}>
              <div className="flex justify-between text-xs text-[#EAE6E3] mb-1">
                <span>{channel.name}</span>
                <span>{data[range][channel.name].toFixed(1)}</span>
                <span>{channel.opposite}</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                step="0.1"
                value={data[range][channel.name]}
                onChange={(e) => handleChange(range, channel.name, e.target.value)}
                className="w-full h-2 bg-[#2B2B2B] rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${channel.color}, #2B2B2B, ${channel.opposite === 'red' ? '#FF0000' : channel.opposite === 'green' ? '#00FF00' : '#0000FF'})`
                }}
              />
            </div>
          ))}
        </div>
      ))}

      <button
        onClick={() => onChange({
          shadows: { cyan: 0, magenta: 0, yellow: 0 },
          midtones: { cyan: 0, magenta: 0, yellow: 0 },
          highlights: { cyan: 0, magenta: 0, yellow: 0 }
        })}
        className="w-full px-3 py-1.5 bg-[#2B2B2B] hover:bg-[#4A4A4A] text-[#EAE6E3] text-xs font-semibold rounded transition-colors"
      >
        Reset All
      </button>
    </div>
  );
}