"use client";
import React, { JSX } from "react";
import { CustomButton } from "@/app/components/blog/Custombutton";
import { CalloutBox } from "@/app/components/blog/Calloutbox";
import Image from "next/image";

interface RichTextProps {
  content: any;
}

export function RenderLexicalRichText({ content }: RichTextProps): JSX.Element {
  if (!content?.root) {
    return <div className="text-gray-500 italic">No content available.</div>;
  }

  const renderNode = (node: any, index: number): JSX.Element | null => {
    if (!node) return null;

    switch (node.type) {
      // Paragraph
      case "paragraph":
        return (
          <p key={index} className="mb-4 leading-relaxed">
            {node.children?.map((child: any, i: number) => renderNode(child, i))}
          </p>
        );

      // Text nodes with formatting
      case "text": {
        let text = node.text || "";
        let element: React.ReactNode = text;

        // Apply formatting flags
        if (node.format) {
          if (node.format & 1) element = <strong>{element}</strong>; // Bold
          if (node.format & 2) element = <em>{element}</em>; // Italic
          if (node.format & 8) element = <u>{element}</u>; // Underline
          if (node.format & 4) element = <s>{element}</s>; // Strikethrough
          if (node.format & 16) element = <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">{element}</code>; // Inline code
          if (node.format & 32) element = <sub>{element}</sub>; // Subscript
          if (node.format & 64) element = <sup>{element}</sup>; // Superscript
        }

        // Apply text color/style if present
        if (node.style) {
          element = (
            <span style={{ color: node.style }} className="inline">
              {element}
            </span>
          );
        }

        return <span key={index}>{element}</span>;
      }

      // Headings
      case "heading": {
        const HeadingTag = (node.tag || "h2") as keyof JSX.IntrinsicElements;
        const headingClasses = {
          h1: "text-4xl font-bold my-6",
          h2: "text-3xl font-bold my-5",
          h3: "text-2xl font-bold my-4",
          h4: "text-xl font-bold my-3",
          h5: "text-lg font-bold my-3",
          h6: "text-base font-bold my-2",
        };

        return (
          <HeadingTag 
            key={index} 
            id={node.id}
            className={headingClasses[HeadingTag as keyof typeof headingClasses] || "font-bold my-4"}
          >
            {node.children?.map((child: any, i: number) => renderNode(child, i))}
          </HeadingTag>
        );
      }

      // Links
      case "link": {
        const linkProps = node.fields?.openInNewTab || node.newTab
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {};

        return (
          <a
            key={index}
            href={node.fields?.url || node.url || "#"}
            className="text-blue-600 hover:text-blue-800 underline transition-colors"
            {...linkProps}
          >
            {node.children?.map((child: any, i: number) => renderNode(child, i))}
          </a>
        );
      }

      // Lists
      case "list": {
        const ListTag = node.listType === "number" ? "ol" : "ul";
        const listClass = node.listType === "number" 
          ? "list-decimal ml-6 my-4 space-y-2" 
          : "list-disc ml-6 my-4 space-y-2";

        return (
          <ListTag key={index} className={listClass}>
            {node.children?.map((child: any, i: number) => renderNode(child, i))}
          </ListTag>
        );
      }

      // List Items
      case "listitem":
        return (
          <li key={index} className="leading-relaxed">
            {node.children?.map((child: any, i: number) => renderNode(child, i))}
          </li>
        );

      // Blockquote
      case "quote":
        return (
          <blockquote 
            key={index} 
            className="border-l-4 border-gray-300 pl-4 py-2 my-4 italic text-gray-700 bg-gray-50"
          >
            {node.children?.map((child: any, i: number) => renderNode(child, i))}
          </blockquote>
        );

      // Code blocks
      case "code":
        return (
          <pre key={index} className="bg-gray-900 text-gray-100 p-4 rounded-lg my-4 overflow-x-auto">
            <code className="text-sm font-mono">
              {node.children?.map((child: any) => child.text).join("") || ""}
            </code>
          </pre>
        );

      // Horizontal rule
      case "horizontalrule":
        return <hr key={index} className="my-8 border-t border-gray-300" />;

      // Line breaks
      case "linebreak":
        return <br key={index} />;

      // Upload/Image nodes
      case "upload": {
        const value = node.value;
        if (value && typeof value === "object" && value.url) {
          return (
            <figure key={index} className="my-6">
              <div className="relative w-full h-auto rounded-lg overflow-hidden">
                <Image
                  src={value.url}
                  alt={value.alt || ""}
                  width={value.width || 1200}
                  height={value.height || 800}
                  className="w-full h-auto object-cover rounded-lg"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                />
              </div>
              {value.alt && (
                <figcaption className="text-sm text-gray-600 text-center mt-2 italic">
                  {value.alt}
                </figcaption>
              )}
            </figure>
          );
        }
        return null;
      }

      // Custom Blocks
      case "block": {
        const blockData = node.fields;

        // Custom Button Block
        if (blockData?.blockType === "customButton") {
          return (
            <CustomButton
              key={index}
              buttonText={blockData.buttonText}
              buttonLink={blockData.buttonLink}
              buttonStyle={blockData.buttonStyle || "primary"}
              openInNewTab={blockData.openInNewTab}
              buttonSize={blockData.buttonSize || "medium"}
              alignment={blockData.alignment || "left"}
            />
          );
        }

        // Callout Block
        if (blockData?.blockType === "callout") {
          return (
            <CalloutBox
              key={index}
              content={blockData.content}
              type={blockData.type || "info"}
            />
          );
        }

        // Fallback for unknown blocks
        return (
          <div key={index} className="p-4 bg-yellow-50 border border-yellow-200 rounded my-4">
            <p className="text-sm text-yellow-800">
              Unknown block type: {blockData?.blockType}
            </p>
          </div>
        );
      }

      // Table support (if you add tables in the future)
      case "table":
        return (
          <div key={index} className="overflow-x-auto my-6">
            <table className="min-w-full border-collapse border border-gray-300">
              <tbody>
                {node.children?.map((child: any, i: number) => renderNode(child, i))}
              </tbody>
            </table>
          </div>
        );

      case "tablerow":
        return (
          <tr key={index} className="border-b border-gray-300">
            {node.children?.map((child: any, i: number) => renderNode(child, i))}
          </tr>
        );

      case "tablecell":
        return (
          <td key={index} className="border border-gray-300 px-4 py-2">
            {node.children?.map((child: any, i: number) => renderNode(child, i))}
          </td>
        );

      // Fallback for unknown node types
      default:
        // If node has children, try to render them
        if (node.children && Array.isArray(node.children)) {
          return (
            <div key={index} className="my-2">
              {node.children.map((child: any, i: number) => renderNode(child, i))}
            </div>
          );
        }

      
        if (process.env.NODE_ENV === "development") {
          console.warn("Unknown Lexical node type:", node.type, node);
        }

        return null;
    }
  };

  return (
    <div className="prose prose-lg max-w-none prose-headings:font-bold prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl">
      {content.root.children?.map((node: any, i: number) => renderNode(node, i))}
    </div>
  );
}