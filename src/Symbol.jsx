export default function Symbol({ src, className }) {
  return (
    <div className={`symbol-wrapper ${className || ""}`}>
      <img src={src} className="symbol-img" draggable="false" />
    </div>
  );
}
