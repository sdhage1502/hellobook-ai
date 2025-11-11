import Link from "next/link";

interface CustomButtonProps {
  buttonText: string;
  buttonLink: string;
  buttonStyle: "primary" | "secondary" | "outline" | "ghost";
  openInNewTab?: boolean;
  buttonSize?: "small" | "medium" | "large";
  alignment?: "left" | "center" | "right";
}

export function CustomButton({
  buttonText,
  buttonLink,
  buttonStyle = "primary",
  openInNewTab = false,
  buttonSize = "medium",
  alignment = "left",
}: CustomButtonProps) {
  // Base styles
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

  // Size styles
  const sizeStyles = {
    small: "px-4 py-2 text-sm",
    medium: "px-6 py-3 text-base",
    large: "px-8 py-4 text-lg",
  };

  // Button style variants
  const styleVariants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm hover:shadow-md",
    secondary: "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 shadow-sm hover:shadow-md",
    outline: "border-2 border-blue-600 text-blue-600  bg-orange-500 hover:bg-blue-50 focus:ring-blue-500",
    ghost: "text-blue-600  bg-yellow-200 hover:bg-blue-50 focus:ring-blue-500",
  };

  // Alignment styles
  const alignmentStyles = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  const buttonClasses = `${baseStyles} ${sizeStyles[buttonSize]} ${styleVariants[buttonStyle]}`;
  const containerClasses = alignmentStyles[alignment];

  const linkProps = openInNewTab
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  // Check if it's an external link
  const isExternal = buttonLink.startsWith("http") || buttonLink.startsWith("https");

  return (
    <div className={`my-6 ${containerClasses}`}>
      {isExternal ? (
        <a
          href={buttonLink}
          className={buttonClasses}
          {...linkProps}
        >
          {buttonText}
          {openInNewTab && (
            <svg
              className="w-4 h-4 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          )}
        </a>
      ) : (
        <Link href={buttonLink} className={buttonClasses} {...linkProps}>
          {buttonText}
          {openInNewTab && (
            <svg
              className="w-4 h-4 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          )}
        </Link>
      )}
    </div>
  );
}