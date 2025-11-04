import { MessageSquare } from "lucide-react";

export const FloatingButtons = () => (
  <>
    {/* WhatsApp */}
    <a
      href="https://wa.me/1234567890"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-8 left-8 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 z-50"
    >
      <MessageSquare className="w-7 h-7 text-white" />
    </a>

    {/* Chat Support */}
    <button className="fixed bottom-8 right-8 w-14 h-14 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 z-50">
      <div className="relative">
        <MessageSquare className="w-7 h-7 text-white" />
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-400 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse">
          1
        </div>
      </div>
    </button>
  </>
);