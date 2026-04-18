export const Logo = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const sizes = {
    sm: { wrap: "gap-1.5", shape: "h-4 w-4", text: "text-lg" },
    md: { wrap: "gap-2", shape: "h-5 w-5", text: "text-2xl" },
    lg: { wrap: "gap-2.5", shape: "h-7 w-7", text: "text-4xl" },
  }[size];

  return (
    <div className={`flex items-center ${sizes.wrap}`}>
      <div className="flex items-center -space-x-1">
        <div className={`${sizes.shape} rounded-full bg-primary border-2 border-ink`} />
        <div className={`${sizes.shape} bg-secondary border-2 border-ink`} />
        <div
          className={`${sizes.shape} bg-accent border-2 border-ink`}
          style={{ clipPath: "polygon(50% 0, 100% 100%, 0 100%)" }}
        />
      </div>
      <span className={`heading-display ${sizes.text} text-ink`}>CREONIX</span>
    </div>
  );
};
