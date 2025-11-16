import React from "react";
import { FileText, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function FileItem({ file, newName, onRemove, hasPattern }) {
  return (
    <div className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 bg-gradient-to-r from-white to-gray-50">
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
            <FileText className="w-6 h-6 text-indigo-600" />
          </div>
        </div>

        <div className="flex-1 min-w-0 grid md:grid-cols-2 gap-4 items-center">
          {/* Original Name */}
          <div>
            <div className="text-xs text-gray-500 mb-1">Original Name</div>
            <div className="font-medium text-gray-900 truncate">
              {file.originalName}
            </div>
          </div>

          {/* Arrow and New Name */}
          {hasPattern ? (
            <div className="flex items-center gap-3">
              <ArrowRight className="w-5 h-5 text-indigo-500 flex-shrink-0 hidden md:block" />
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-1">New Name</div>
                <div className="font-semibold text-indigo-600 truncate">
                  {newName}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center">
              <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
                Click naming boxes to rename
              </Badge>
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="flex-shrink-0 hover:bg-red-50 hover:text-red-600"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}