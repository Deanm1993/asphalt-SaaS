import React from "react";

interface ViableLogoProps extends React.SVGProps<SVGSVGElement> {}

export const ViableLogo: React.FC<ViableLogoProps> = ({
  width = 40,
  height = 40,
  className,
  ...props
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Circular background */}
      <circle cx="20" cy="20" r="20" fill="#2D3142" />
      
      {/* Road/asphalt pattern */}
      <rect x="8" y="10" width="24" height="20" rx="2" fill="#4F5D75" />
      
      {/* Road markings */}
      <rect x="12" y="19" width="16" height="2" fill="#FFFFFF" />
      <rect x="12" y="15" width="16" height="1" fill="#FFFFFF" opacity="0.5" />
      <rect x="12" y="24" width="16" height="1" fill="#FFFFFF" opacity="0.5" />
      
      {/* "V" shape for Viable */}
      <path
        d="M14 10L20 26L26 10"
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Asphalt texture overlay */}
      <circle
        cx="20"
        cy="20"
        r="16"
        fill="url(#asphaltPattern)"
        fillOpacity="0.1"
      />
      
      {/* Definitions for patterns and gradients */}
      <defs>
        <pattern
          id="asphaltPattern"
          patternUnits="userSpaceOnUse"
          width="4"
          height="4"
          patternTransform="rotate(45)"
        >
          <rect width="1" height="1" fill="#1A1D29" />
        </pattern>
      </defs>
    </svg>
  );
};

export default ViableLogo;
