import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ChevronUp, ChevronDown, Eye, EyeOff } from "lucide-react";
import CurvesNode from "./CurvesNode";
import ColorBalanceNode from "./ColorBalanceNode";
import HSLSecondaryNode from "./HSLSecondaryNode";
import LUTNode from "./LUTNode";

export default function ColorGradingPanel({ nodes, setNodes, onApply }) {
  const [expandedNode, setExpandedNode] = useState(null);

  const addNode = (type) => {
    const newNode = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      enabled: true,
      data: getDefaultNodeData(type)
    };
    setNodes([...nodes, newNode]);
  };

  const getDefaultNodeData = (type) => {
    switch (type) {
      case 'curves':
        return {
          master: Array(256).fill(0).map((_, i) => ({ x: i, y: i })),
          red: Array(256).fill(0).map((_, i) => ({ x: i, y: i })),
          green: Array(256).fill(0).map((_, i) => ({ x: i, y: i })),
          blue: Array(256).fill(0).map((_, i) => ({ x: i, y: i })),
          activeChannel: 'master'
        };
      case 'colorBalance':
        return {
          shadows: { cyan: 0, magenta: 0, yellow: 0 },
          midtones: { cyan: 0, magenta: 0, yellow: 0 },
          highlights: { cyan: 0, magenta: 0, yellow: 0 }
        };
      case 'hslSecondary':
        return {
          hueRange: [0, 360],
          saturationRange: [0, 100],
          luminanceRange: [0, 100],
          hueShift: 0,
          saturationAdjust: 0,
          luminanceAdjust: 0
        };
      case 'lut':
        return {
          lutFile: null,
          lutData: null,
          intensity: 100
        };
      default:
        return {};
    }
  };

  const removeNode = (id) => {
    setNodes(nodes.filter(node => node.id !== id));
  };

  const toggleNode = (id) => {
    setNodes(nodes.map(node => 
      node.id === id ? { ...node, enabled: !node.enabled } : node
    ));
  };

  const moveNode = (id, direction) => {
    const index = nodes.findIndex(node => node.id === id);
    if (direction === 'up' && index > 0) {
      const newNodes = [...nodes];
      [newNodes[index - 1], newNodes[index]] = [newNodes[index], newNodes[index - 1]];
      setNodes(newNodes);
    } else if (direction === 'down' && index < nodes.length - 1) {
      const newNodes = [...nodes];
      [newNodes[index], newNodes[index + 1]] = [newNodes[index + 1], newNodes[index]];
      setNodes(newNodes);
    }
  };

  const updateNodeData = (id, newData) => {
    setNodes(nodes.map(node => 
      node.id === id ? { ...node, data: { ...node.data, ...newData } } : node
    ));
  };

  const getNodeLabel = (type) => {
    const labels = {
      curves: 'Curves',
      colorBalance: 'Color Balance',
      hslSecondary: 'HSL Secondary',
      lut: 'LUT'
    };
    return labels[type] || type;
  };

  const renderNode = (node) => {
    switch (node.type) {
      case 'curves':
        return <CurvesNode data={node.data} onChange={(data) => updateNodeData(node.id, data)} />;
      case 'colorBalance':
        return <ColorBalanceNode data={node.data} onChange={(data) => updateNodeData(node.id, data)} />;
      case 'hslSecondary':
        return <HSLSecondaryNode data={node.data} onChange={(data) => updateNodeData(node.id, data)} />;
      case 'lut':
        return <LUTNode data={node.data} onChange={(data) => updateNodeData(node.id, data)} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-3 px-2 py-1.5 bg-[#A88A86] text-black font-bold text-sm rounded">
        COLOR GRADING NODES
      </div>

      <div className="mb-3 grid grid-cols-2 gap-1.5">
        <button
          onClick={() => addNode('curves')}
          className="px-2 py-1.5 bg-[#3A3A3A] hover:bg-[#4A4A4A] text-[#EAE6E3] text-xs font-semibold rounded transition-colors"
        >
          + Curves
        </button>
        <button
          onClick={() => addNode('colorBalance')}
          className="px-2 py-1.5 bg-[#3A3A3A] hover:bg-[#4A4A4A] text-[#EAE6E3] text-xs font-semibold rounded transition-colors"
        >
          + Color Balance
        </button>
        <button
          onClick={() => addNode('hslSecondary')}
          className="px-2 py-1.5 bg-[#3A3A3A] hover:bg-[#4A4A4A] text-[#EAE6E3] text-xs font-semibold rounded transition-colors"
        >
          + HSL Secondary
        </button>
        <button
          onClick={() => addNode('lut')}
          className="px-2 py-1.5 bg-[#3A3A3A] hover:bg-[#4A4A4A] text-[#EAE6E3] text-xs font-semibold rounded transition-colors"
        >
          + LUT
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {nodes.length === 0 ? (
          <div className="text-center text-gray-500 text-xs py-4">
            No nodes yet. Click above to add color grading nodes.
          </div>
        ) : (
          nodes.map((node, index) => (
            <div
              key={node.id}
              className={`bg-[#3A3A3A] rounded-lg overflow-hidden ${
                !node.enabled ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-center gap-2 px-2 py-2 bg-[#2B2B2B]">
                <button
                  onClick={() => toggleNode(node.id)}
                  className="hover:opacity-70 transition-opacity"
                >
                  {node.enabled ? (
                    <Eye className="w-4 h-4 text-[#A88A86]" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-gray-500" />
                  )}
                </button>
                <span className="flex-1 text-xs font-semibold text-[#EAE6E3]">
                  {getNodeLabel(node.type)}
                </span>
                <button
                  onClick={() => moveNode(node.id, 'up')}
                  disabled={index === 0}
                  className="hover:opacity-70 transition-opacity disabled:opacity-30"
                >
                  <ChevronUp className="w-4 h-4 text-[#EAE6E3]" />
                </button>
                <button
                  onClick={() => moveNode(node.id, 'down')}
                  disabled={index === nodes.length - 1}
                  className="hover:opacity-70 transition-opacity disabled:opacity-30"
                >
                  <ChevronDown className="w-4 h-4 text-[#EAE6E3]" />
                </button>
                <button
                  onClick={() => setExpandedNode(expandedNode === node.id ? null : node.id)}
                  className="hover:opacity-70 transition-opacity"
                >
                  <Plus className={`w-4 h-4 text-[#EAE6E3] transition-transform ${
                    expandedNode === node.id ? 'rotate-45' : ''
                  }`} />
                </button>
                <button
                  onClick={() => removeNode(node.id)}
                  className="hover:opacity-70 transition-opacity"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
              {expandedNode === node.id && (
                <div className="p-2">
                  {renderNode(node)}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <button
        onClick={onApply}
        className="mt-3 w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded transition-colors"
      >
        APPLY ALL NODES
      </button>
    </div>
  );
}