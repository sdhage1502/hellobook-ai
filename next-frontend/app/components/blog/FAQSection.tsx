"use client";

import { useState } from "react";
import { RenderLexicalRichText } from "../rich-text/RichTextRenderer";
import { Blog } from "../../../../payload-cms/src/payload-types";

type FAQItem = NonNullable<Blog["faq"]>[0];

interface FAQSectionProps {
  faqs: FAQItem[];
}

export function FAQSection({ faqs }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="my-16 px-6 py-8 bg-gray-50 rounded-xl">
      <h2 className="text-3xl font-bold mb-8 text-gray-900">
        Frequently Asked Questions
      </h2>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={faq.id || index}
            className="bg-white rounded-lg  overflow-hidden transition-all duration-200 hover:shadow-md"
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full px-6 py-4 text-left flex items-center justify-between gap-4"
              aria-expanded={openIndex === index}
            >
              <span className="text-lg font-semibold text-gray-900 flex-1">
                {faq.question}
              </span>

              <svg
                className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                  openIndex === index ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            <div
              className={`overflow-hidden transition-all duration-200 ${
                openIndex === index
                  ? "max-h-[1000px] opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              <div className="px-6 pb-4 prose prose-sm max-w-none text-gray-700">
                <RenderLexicalRichText content={faq.answer} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
