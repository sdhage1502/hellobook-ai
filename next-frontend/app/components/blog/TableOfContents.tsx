"use client";
import { useEffect, useState, useCallback } from "react";

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  contentRef?: React.RefObject<HTMLElement>;
}

export default function TableOfContents({ contentRef }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const article = contentRef?.current || document.querySelector("article#blog-content");
    if (!article) return;

    const headingElements = article.querySelectorAll("h2, h3, h4, h5, h6");
    const items: TOCItem[] = [];
    headingElements.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
      const text = heading.textContent?.trim() || "";
      if (!text) return;

      let id = heading.id;
      if (!id) {
        id = `heading-${index}-${text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")}`;
        heading.id = id;
      }
      items.push({ id, text, level });
    });

    // Avoid synchronous state updates in useEffect
    setTimeout(() => setHeadings(items), 0);

    // Intersection Observer for active heading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-80px 0px -50% 0px", // Adjusted for better visibility
        threshold: 0.5, // 50% intersection
      }
    );

    headingElements.forEach((heading) => observer.observe(heading));

    return () => {
      observer.disconnect();
    };
  }, [contentRef]);

  const scrollToHeading = useCallback((e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // Fixed header offset
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top: elementPosition - offset, behavior: "smooth" });
    }
  }, []);

  if (headings.length === 0) return null;

  return (
    <nav className="sticky top-8 p-6  overflow-y-auto" aria-label="Table of contents">
      <h3 className="font-semibold text-lg mb-4 text-gray-900">Table of Contents</h3>
      <ul className="space-y-2 text-sm">
        {headings.map((heading) => {
          const indentClass = `ml-${heading.level * 4}`; // Dynamic indent
          return (
            <li key={heading.id} className={indentClass}>
              <a
                href={`#${heading.id}`}
                onClick={(e) => scrollToHeading(e, heading.id)}
                className={`block py-1 border-l-2 pl-3 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  activeId === heading.id
                    ? "border-blue-600 text-blue-600 font-medium"
                    : "border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-400"
                }`}
              >
                {heading.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}