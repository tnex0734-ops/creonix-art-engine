export type Style = {
  name: string;
  tag: string;
  swatch: [string, string, string]; // 3 representative HSL CSS colors for placeholder card
  shape: "circle" | "triangle" | "square" | "cross" | "arc" | "stripes";
};

export const STYLES: Style[] = [
  { name: "Flat 2.0", tag: "flat-2", swatch: ["#1A4BDB", "#F5C400", "#E63030"], shape: "circle" },
  { name: "Isometric", tag: "isometric", swatch: ["#0F2F8C", "#3D6BFF", "#F5C400"], shape: "square" },
  { name: "3D Clay", tag: "clay", swatch: ["#F2A6A1", "#FAD79B", "#A8C7E0"], shape: "circle" },
  { name: "Glassmorphism", tag: "glass", swatch: ["#7BA9FF", "#C5C5FF", "#FFC2EE"], shape: "arc" },
  { name: "Retro Revival", tag: "retro", swatch: ["#D9622E", "#E8B85E", "#3B2A20"], shape: "stripes" },
  { name: "Psychedelic", tag: "psychedelic", swatch: ["#FF3CAC", "#784BA0", "#2B86C5"], shape: "circle" },
  { name: "Cartoon / Character", tag: "cartoon", swatch: ["#F5C400", "#1A4BDB", "#E63030"], shape: "triangle" },
  { name: "Digital Collage", tag: "collage", swatch: ["#FFD8BE", "#5B7DB1", "#E63030"], shape: "cross" },
  { name: "Nature / Eco", tag: "nature", swatch: ["#3F7D44", "#A8C56C", "#E8DCB8"], shape: "arc" },
  { name: "Hand-drawn / Sketch", tag: "sketch", swatch: ["#F4EFE6", "#3B3B3B", "#9D9D9D"], shape: "stripes" },
  { name: "Doodle / Whimsical", tag: "doodle", swatch: ["#FFFFFF", "#111111", "#F5C400"], shape: "cross" },
  { name: "Folk / Cultural Art", tag: "folk", swatch: ["#A8243B", "#1F4E79", "#F2C744"], shape: "triangle" },
];

export const PALETTE_PRESETS: { name: string; colors: string[] }[] = [
  { name: "Bauhaus", colors: ["#E63030", "#1A4BDB", "#F5C400", "#111111", "#FFFFFF"] },
  { name: "Earth", colors: ["#6B3A2A", "#A0522D", "#CD7F32", "#E8C07A", "#F4EFE6"] },
  { name: "Ocean", colors: ["#0C2340", "#1A4A6E", "#2D8A9E", "#5CBDB9", "#E8F0F8"] },
  { name: "Sunset", colors: ["#FF6B35", "#F7931E", "#E84393", "#6C5CE7", "#FFE8D6"] },
  { name: "Forest", colors: ["#1A3C2A", "#2D5A3D", "#5A8A5C", "#A0C49D", "#F5F0E8"] },
  { name: "Mono", colors: ["#0A0A0A", "#3A3A3A", "#7A7A7A", "#C8C8C8", "#FFFFFF"] },
  { name: "Pop", colors: ["#FF3CAC", "#784BA0", "#2B86C5", "#F5C400", "#FFFFFF"] },
  { name: "Vintage", colors: ["#D9622E", "#E8B85E", "#3B2A20", "#A8927A", "#F0E6D2"] },
];
