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
  send_plane: {
    viewBox: "0 0 24 24",
    paths: [
      "M22 2L11 13",
      "M22 2L15 22L11 13L2 9L22 2Z",
    ],
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
  search: {
    viewBox: "0 0 16 16",
    paths: [
      "M7 12A5 5 0 107 2a5 5 0 000 10z",
      "M14 14l-3.25-3.25",
    ],
  },
  accessibility: {
    viewBox: "0 0 16 16",
    paths: [
      "M8 4.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z",
      "M4 6.5l4 1 4-1",
      "M8 7.5v3",
      "M6 14l2-3.5L10 14",
    ],
  },
  token: {
    viewBox: "0 0 16 16",
    paths: [
      "M4 2h8a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z",
      "M6 5h4",
      "M6 8h4",
      "M6 11h2",
    ],
  },
  book: {
    viewBox: "0 0 16 16",
    paths: [
      "M2 2.5A.5.5 0 012.5 2H5a3 3 0 013 3v9.5a2 2 0 00-2-2H2.5a.5.5 0 01-.5-.5v-9.5z",
      "M14 2.5a.5.5 0 00-.5-.5H11a3 3 0 00-3 3v9.5a2 2 0 012-2h2.5a.5.5 0 00.5-.5v-9.5z",
    ],
  },
  paperclip: {
    viewBox: "0 0 16 16",
    paths: [
      "M13.09 3.41a3 3 0 00-4.24 0L4.1 8.17a2 2 0 002.83 2.83l4.76-4.76a1 1 0 00-1.42-1.41L5.51 9.59",
    ],
  },
  sparkle: {
    viewBox: "0 0 24 24",
    paths: [
      "M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z",
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
