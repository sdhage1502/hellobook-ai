"use client";
import React, { useMemo, useState, useEffect } from "react";
import { CustomButton } from "@/app/components/blog/Custombutton";
import { CalloutBox } from "@/app/components/blog/Calloutbox";
import Image from "next/image";
import { getInternalLinkRules } from "@/app/lib/payloadClient";
import { applyLinksToContent } from "@/app/lib/serializeLexicalToHTML";

interface RichTextProps {
  content: any;
  site?: string;
  seoImages?: any[];
}

export function RenderLexicalRichText({ content, site, seoImages = [] }: RichTextProps): JSX.Element {
  const [rules, setRules] = useState<any[]>([]);

  useEffect(() => {
    if (site) getInternalLinkRules(site).then(setRules);
  }, [site]);

  if (!content?.root) return <div className="text-gray-500 italic">No content available.</div>;

  const linkedHtml = useMemo(() => applyLinksToContent(content, rules, site), [content, rules, site]);

  return (
    <div 
      className="prose prose-lg max-w-none prose-headings:font-bold prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl"
      dangerouslySetInnerHTML={{ __html: linkedHtml }}
    />
  );
}

// ... (full renderNode for JSX fallback if needed, as in previous)