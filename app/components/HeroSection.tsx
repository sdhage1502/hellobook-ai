"use client";

import { useEffect, useState } from "react";
import { Sparkles, TrendingUp ,ArrowRight,} from "lucide-react";
import Image from "next/image";

export const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="bg-linear-to-b from-blue-50/30 via-white to-green-50/20 py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div className="space-y-8">
            <div
              className={`inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full text-sm text-gray-600 transition-all duration-700 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              Discover HelloBooks
            </div>

            <h1
              className={`text-5xl lg:text-6xl font-bold text-gray-800 leading-tight transition-all duration-1000 delay-200 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              The Best AI-Agent Bookkeeping Software for{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-500 to-blue-600 animate-pulse">
                Smarter
              </span>{" "}
              Accounting
            </h1>

            <p
              className={`text-lg text-gray-600 leading-relaxed transition-all duration-1000 delay-400 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              Forget about bookkeeping, taxes, billing and all the other things on your list of
              Operations — unsightly paper-pushing Operations — and believe in the magic of AI
              automation.
            </p>

            <div
              className={`flex flex-wrap gap-4 transition-all duration-1000 delay-600 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <button className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-all hover:shadow-xl hover:scale-105 flex items-center space-x-2">
                <span>Get a Free Demo</span>
                <span className="animate-bounce"><ArrowRight /></span>
              </button>
              <button className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-all hover:shadow-xl hover:scale-105">
                Learn More
              </button>
            </div>
          </div>

          {/* Right – Dashboard preview */}
          <div
            className={`relative transition-all duration-1000 delay-800 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"
            }`}
          >
            <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
              {/* Card 1 */}
              <div className="bg-linear-to-br from-green-50 to-blue-50 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center animate-pulse">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">Boost Efficiency</h3>
                    <p className="text-sm text-gray-600">AI-Powered Budgeting for</p>
                    <p className="text-sm text-gray-600">Smarter Financial Spending.</p>
                  </div>
                </div>
                <Image
                  width={400}
                  height={48}
                  src="/hero.jpeg"
                  alt="Professional"
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>

              {/* Card 2 – Chart */}
              <div className="bg-white border border-gray-100 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-800">Analysis</h4>
                  <div className="flex items-center space-x-4 text-xs">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-gray-600">Income</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
                      <span className="text-gray-600">Outcome</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-end justify-between h-32 space-x-2">
                  {[70, 85, 60, 75, 90, 55, 80, 65].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 flex flex-col items-center space-y-1"
                    >
                      <div
                        className={`w-full rounded-t transition-all duration-500 hover:opacity-80 ${
                          i % 2 === 0 ? "bg-green-400" : "bg-blue-400"
                        }`}
                        style={{
                          height: `${h}%`,
                          animationDelay: `${i * 100}ms`,
                        }}
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2">Total Deposit</p>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold text-gray-800">$162.40K</p>
                    <div className="flex items-center space-x-1 text-xs">
                      <TrendingUp className="w-4 h-4 text-red-400" />
                      <span className="text-red-400">-2.6%</span>
                      <span className="text-gray-500">Less than Last Week</span>
                    </div>
                  </div>
                  <div className="mt-2 bg-green-400 h-1 rounded-full w-3/4 animate-pulse" />
                </div>
              </div>
            </div>

            {/* Chat widget */}
            <div className="absolute bottom-4 right-4 bg-white rounded-full shadow-lg px-4 py-3 flex items-center space-x-2 animate-bounce">
            
              <span className="text-sm text-gray-700">Hi! How can we help?</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </section>
  );
};