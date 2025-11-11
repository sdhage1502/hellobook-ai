"use client";

import { useEffect, useState } from "react";


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
    // Extract headings from the content
    const article = contentRef?.current || document.querySelector("article");
    if (!article) return;

    const headingElements = article.querySelectorAll("h2, h3");
    const items: TOCItem[] = [];

    headingElements.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
      const text = heading.textContent || "";
      
      // Create or use existing ID
      let id = heading.id;
      if (!id) {
        id = `heading-${index}-${text.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
        heading.id = id;
      }

      items.push({ id, text, level });
    });

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHeadings(items);

    // Set up intersection observer for active heading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-80px 0px -80% 0px",
        threshold: 1,
      }
    );

    headingElements.forEach((heading) => {
      observer.observe(heading);
    });

    return () => {
      headingElements.forEach((heading) => {
        observer.unobserve(heading);
      });
    };
  }, [contentRef]);

  if (headings.length === 0) return null;

  const scrollToHeading = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Account for fixed header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <nav className="sticky top-8 p-6 pt-18 ">
      <h3 className="font-semibold text-lg mb-4 text-gray-900">
        Table of Contents
      </h3>
      <ul className="space-y-2 text-sm">
        {headings.map((heading) => (
          <li
            key={heading.id}
            className={`${
              heading.level === 3 ? "ml-4" : ""
            }`}
          >
            <a
              href={`#${heading.id}`}
              onClick={(e) => scrollToHeading(e, heading.id)}
              className={`block py-1 border-l-2 pl-3 transition-colors ${
                activeId === heading.id
                  ? "border-blue-600 text-blue-600 font-medium"
                  : "border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-400"
              }`}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}