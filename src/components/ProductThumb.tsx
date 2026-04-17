type ProductThumbProps = {
  darkMode: boolean;
};

export default function ProductThumb({ darkMode }: ProductThumbProps) {
  return (
    <div
      className={`h-14 w-14 rounded-xl shadow-inner ${
        darkMode
          ? "bg-gradient-to-br from-cyan-300 to-blue-500"
          : "bg-gradient-to-br from-[#2C3DA6]/30 to-[#EF7CAF]/50"
      }`}
    />
  );
}