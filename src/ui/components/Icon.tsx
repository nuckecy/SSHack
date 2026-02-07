import React from "react";

interface IconDef {
  viewBox: string;
  paths: string[];
}

const ICONS: Record<string, IconDef> = {
  shield: {
    viewBox: "-1 -1 22 22",
    paths: [
      "M10 1L2 4.5v5.5c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V4.5L10 1z",
      "M7 10l2 2 4-4",
    ],
  },
  menu: {
    viewBox: "0 0 16 16",
    paths: ["M2 4h12", "M2 8h12", "M2 12h12"],
  },
  settings: {
    viewBox: "0 0 16 16",
    paths: [
      "M6.5 1h3l.4 2.1a5.5 5.5 0 011.3.7l2-.8 1.5 2.6-1.6 1.3a5.6 5.6 0 010 1.5l1.6 1.3-1.5 2.6-2-.8a5.5 5.5 0 01-1.3.7L9.5 15h-3l-.4-2.1a5.5 5.5 0 01-1.3-.7l-2 .8-1.5-2.6 1.6-1.3a5.6 5.6 0 010-1.5L1.3 6.3l1.5-2.6 2 .8a5.5 5.5 0 011.3-.7L6.5 1z",
      "M8 10.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z",
    ],
  },
  delete: {
    viewBox: "0 0 16 16",
    paths: [
      "M2 4h12M5.33 4V2.67a1.33 1.33 0 011.34-1.34h2.66a1.33 1.33 0 011.34 1.34V4M12.67 4v9.33a1.33 1.33 0 01-1.34 1.34H4.67a1.33 1.33 0 01-1.34-1.34V4",
      "M6.67 7.33v4",
      "M9.33 7.33v4",
    ],
  },
  chevron_left: {
    viewBox: "0 0 16 16",
    paths: ["M10 12L6 8l4-4"],
  },
  chevron_right: {
    viewBox: "0 0 16 16",
    paths: ["M6 4l4 4-4 4"],
  },
  send: {
    viewBox: "0 0 16 16",
    paths: ["M14.5 1.5l-6 13-2.5-5.5L1.5 6.5l13-5z", "M14.5 1.5L6 9"],
  },
  check: {
    viewBox: "0 0 16 16",
    paths: ["M3 8l3.5 3.5L13 5"],
  },
  close: {
    viewBox: "0 0 16 16",
    paths: ["M12 4L4 12M4 4l8 8"],
  },
  external_link: {
    viewBox: "0 0 16 16",
    paths: [
      "M12 8.67v4A1.33 1.33 0 0110.67 14H3.33A1.33 1.33 0 012 12.67V5.33A1.33 1.33 0 013.33 4h4",
      "M10 2h4v4",
      "M6.67 9.33L14 2",
    ],
  },
};

interface IconProps {
  name: string;
  size?: number;
  className?: string;
}

export default function Icon({ name, size = 16, className }: IconProps) {
  const icon = ICONS[name];
  if (!icon) return null;
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox={icon.viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {icon.paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}
