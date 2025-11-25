import React, { useState } from "react";
import { 
  Calendar, Clock, Hash, Type, FileText, Minus, 
  ChevronLeft, ChevronRight, X, Plus 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const namingOptions = [
  {
    type: 'original',
    label: 'Original Name',
    icon: FileText,
    color: 'from-blue-500 to-cyan-500',
    description: 'Keep the original filename'
  },
  {
    type: 'date',
    label: 'Date',
    icon: Calendar,
    color: 'from-green-500 to-emerald-500',
    description: 'Add current date (YYYY-MM-DD)'
  },
  {
    type: 'time',
    label: 'Time',
    icon: Clock,
    color: 'from-purple-500 to-pink-500',
    description: 'Add current time (HH-MM-SS)'
  },
  {
    type: 'counter',
    label: 'Counter',
    icon: Hash,
    color: 'from-orange-500 to-red-500',
    description: 'Add sequential number (001, 002...)'
  },
  {
    type: 'text',
    label: 'Custom Text',
    icon: Type,
    color: 'from-indigo-500 to-blue-500',
    description: 'Add your own text',
    hasInput: true
  },
  {
    type: 'separator',
    label: 'Separator',
    icon: Minus,
    color: 'from-gray-500 to-slate-500',
    description: 'Add separator (_ or -)',
    hasInput: true,
    placeholder: '_'
  }
];

export default function NamingOptions({
  namingPattern,
  onAddComponent,
  onRemoveComponent,
  onMoveComponent,
  onUpdateValue
}) {
  const [editingId, setEditingId] = useState(null);

  const handleAddComponent = (option) => {
    onAddComponent({
      type: option.type,
      label: option.label,
      value: option.placeholder || '',
      hasInput: option.hasInput,
      color: option.color
    });
  };

  return (
    <Card className="border-2 shadow-xl bg-white">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Plus className="w-6 h-6 text-indigo-600" />
          Build Your Filename
        </CardTitle>
        <CardDescription>
          Click on the boxes below to add components to your filename
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Available Options */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {namingOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.type}
                onClick={() => handleAddComponent(option)}
                className="group relative p-4 rounded-xl border-2 border-gray-200 hover:border-indigo-400 bg-white hover:bg-gradient-to-br hover:from-white hover:to-indigo-50 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${option.color} flex items-center justify-center mb-2 mx-auto group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-xs font-medium text-gray-700 text-center">
                  {option.label}
                </div>
              </button>
            );
          })}
        </div>

        {/* Current Pattern */}
        {namingPattern.length > 0 && (
          <div className="pt-6 border-t">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                {namingPattern.length}
              </Badge>
              Current Pattern
            </h3>
            <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 min-h-[60px]">
              {namingPattern.map((component, index) => (
                <div
                  key={component.id}
                  className={`group relative flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r ${component.color} text-white shadow-md hover:shadow-lg transition-all`}
                >
                  {/* Move Left */}
                  {index > 0 && (
                    <button
                      onClick={() => onMoveComponent(component.id, 'left')}
                      className="opacity-0 group-hover:opacity-100 absolute -left-2 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center hover:scale-110 transition-all"
                    >
                      <ChevronLeft className="w-4 h-4 text-gray-700" />
                    </button>
                  )}

                  {/* Component Content */}
                  {component.hasInput && editingId === component.id ? (
                    <Input
                      value={component.value}
                      onChange={(e) => onUpdateValue(component.id, e.target.value)}
                      onBlur={() => setEditingId(null)}
                      autoFocus
                      className="w-24 h-7 text-sm bg-white text-gray-900"
                      placeholder={component.label}
                    />
                  ) : (
                    <span
                      className="text-sm font-medium cursor-pointer"
                      onClick={() => component.hasInput && setEditingId(component.id)}
                    >
                      {component.hasInput && component.value
                        ? component.value
                        : component.label}
                    </span>
                  )}

                  {/* Remove Button */}
                  <button
                    onClick={() => onRemoveComponent(component.id)}
                    className="opacity-0 group-hover:opacity-100 w-5 h-5 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all"
                  >
                    <X className="w-3 h-3" />
                  </button>

                  {/* Move Right */}
                  {index < namingPattern.length - 1 && (
                    <button
                      onClick={() => onMoveComponent(component.id, 'right')}
                      className="opacity-0 group-hover:opacity-100 absolute -right-2 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center hover:scale-110 transition-all"
                    >
                      <ChevronRight className="w-4 h-4 text-gray-700" />
                    </button>
                  )}
                </div>
              ))}
              {namingPattern.length === 0 && (
                <div className="w-full text-center text-gray-400 text-sm py-2">
                  Click boxes above to start building your filename
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}