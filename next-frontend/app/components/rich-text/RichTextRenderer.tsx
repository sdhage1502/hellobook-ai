"use client";
import React, { JSX } from "react";

export function RenderLexicalRichText({ content }: { content: any }): JSX.Element {
  if (!content?.root) {
    return <div>No content available.</div>;
  }

  const renderNode = (node: any, index: number): JSX.Element | null => {
    if (!node) return null;

    switch (node.type) {
      // Paragraph
      case "paragraph":
        return (
          <p key={index} className="mb-4">
            {node.children?.map((child: any, i: number) => renderNode(child, i))}
          </p>
        );

      // Text nodes
      case "text":
        let textElement = <span key={index}>{node.text}</span>;
        
        if (node.format) {
          if (node.format & 1) textElement = <strong key={index}>{node.text}</strong>; // Bold
          if (node.format & 2) textElement = <em key={index}>{node.text}</em>; // Italic
          if (node.format & 8) textElement = <code key={index}>{node.text}</code>; // Code
        }
        
        return textElement;

      // Headings
      case "heading":
        const HeadingTag = (node.tag || "h2") as keyof JSX.IntrinsicElements;
        return (
          <HeadingTag key={index} className="font-bold my-4">
            {node.children?.map((child: any, i: number) => renderNode(child, i))}
          </HeadingTag>
        );

      //  Links
      case "link":
        return (
          <a 
            key={index}
            href={node.url || "#"} 
            className="text-blue-600 underline"
            target={node.newTab ? "_blank" : undefined}
            rel={node.newTab ? "noopener noreferrer" : undefined}
          >
            {node.children?.map((child: any, i: number) => renderNode(child, i))}
          </a>
        );

      // Lists
      case "list":
        const ListTag = node.listType === "number" ? "ol" : "ul";
        return (
          <ListTag key={index} className="ml-6 my-4 list-disc">
            {node.children?.map((child: any, i: number) => renderNode(child, i))}
          </ListTag>
        );

      // List Items
      case "listitem":
        return (
          <li key={index} className="mb-2">
            {node.children?.map((child: any, i: number) => renderNode(child, i))}
          </li>
        );

      // Code blocks
      case "code":
        return (
          <pre key={index} className="bg-gray-100 p-4 rounded my-4 overflow-x-auto">
            <code>{node.children?.[0]?.text || ""}</code>
          </pre>
        );

      // Line breaks
      case "linebreak":
        return <br key={index} />;

      // Fallback for unknown types
      default:
        if (node.children) {
          return (
            <div key={index}>
              {node.children.map((child: any, i: number) => renderNode(child, i))}
            </div>
          );
        }
        return null;
    }
  };

  return (
    <div className="prose max-w-none">
      {content.root.children?.map((node: any, i: number) => renderNode(node, i))}
    </div>
  );
}
