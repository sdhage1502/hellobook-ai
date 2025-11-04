"use client";

import { ReactNode, useState } from "react";
import { ChevronDown } from "lucide-react";

interface DropdownProps {
  title: string;
  children: ReactNode;
}

export const Dropdown = ({ title, children }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 font-medium transition-colors">
        <span>{title}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-fit bg-white rounded-xl shadow-xl border border-gray-100 p-4 animate-fadeIn">
          {children}
        </div>
      )}
    </div>
  );
};