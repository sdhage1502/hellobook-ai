"use client";

import { useState } from "react";
import {
  ChevronDown,
  Menu,
  X,
  MessageSquare,
  ArrowUpRight,
} from "lucide-react";
import { FeaturesDropdown } from "./dropdowns/FeaturesDropdown";
import { ExperiencesDropdown } from "./dropdowns/ExperiencesDropdown";
import { IndustriesDropdown } from "./dropdowns/IndustriesDropdown";
import { ResourcesDropdown } from "./dropdowns/ResourcesDropdown";

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-linear-to-br from-blue-400 to-green-400 rounded-lg" />
            <span className="text-xl font-bold text-gray-800">HelloBooks.ai</span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center space-x-8">
            <FeaturesDropdown />
            <ExperiencesDropdown />
            <IndustriesDropdown />
            <span onClick={() => window.location.href = "/blogs"} className="cursor-pointer">Blogs</span>
            <ResourcesDropdown />
          </nav>

          {/* Action Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            <button className="px-6 py-2.5 text-white bg-blue-500 hover:bg-blue-600 rounded-lg font-medium transition-all hover:shadow-lg hover:scale-105">
              Contact Us
            </button>
            <button className="px-6 py-2.5 text-white bg-green-500 hover:bg-green-600 rounded-lg font-medium transition-all hover:shadow-lg hover:scale-105 flex items-center space-x-2">
              <span>Log In</span>
              <span className="text-sm"><ArrowUpRight /></span>
            </button>
            <div className="flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <span className="text-xl">US</span>
              <span className="text-sm text-gray-600">English</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-50"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-6 space-y-4">
            <button className="w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
              Features
            </button>
            <button className="w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
              Experiences
            </button>
            <button className="w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
              Industries
            </button>
            <button className="w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
              Resources
            </button>
            <button className="w-full px-4 py-2.5 text-white bg-blue-500 rounded-lg font-medium">
              Contact Us
            </button>
            <button className="w-full px-4 py-2.5 text-white bg-green-500 rounded-lg font-medium">
              Log In <ArrowUpRight />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};