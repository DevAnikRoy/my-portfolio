import { useMemo, useState } from "react";
import { webflowPreviewPath } from "../data/webflowDeliveries";

function hostLabel(live) {
  try {
    return new URL(live).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function coverCandidates(project) {
  const list = [];
  if (project.image) list.push(project.image);
  const local = project.live ? webflowPreviewPath(project.live) : "";
  if (local && local !== project.image) list.push(local);
  return [...new Set(list.filter(Boolean))];
}

function Fallback({ project, host, className = "" }) {
  return (
    <div
      className={`relative flex h-full w-full flex-col justify-between overflow-hidden bg-[#151221] p-4 ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(120% 80% at 0% 0%, rgba(120,115,245,0.28), transparent 55%), radial-gradient(90% 70% at 100% 100%, rgba(236,119,171,0.18), transparent 50%)",
        }}
      />
        <p className="relative text-[10px] font-semibold uppercase tracking-[0.18em] text-[#A8A4FF]">
          Webflow
        </p>
        {host ? (
          <p className="relative truncate text-xs text-[#8E8E93]">{host}</p>
        ) : (
          <p className="relative text-sm font-medium text-white">{project.title}</p>
        )}
    </div>
  );
}

export default function ProjectCover({ project, className = "" }) {
  const candidates = useMemo(
    () => coverCandidates(project),
    [project.image, project.live]
  );
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const src = candidates[index];
  const host = hostLabel(project.live);

  if (!src) {
    return <Fallback project={project} host={host} className={className} />;
  }

  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`}>
      {!loaded && <div className="absolute inset-0 bg-[#151221]" />}
      <img
        key={src}
        src={src}
        alt={project.title}
        loading="lazy"
        decoding="async"
        ref={(el) => {
          if (el?.complete && el.naturalWidth > 0) setLoaded(true);
        }}
        onLoad={() => setLoaded(true)}
        onError={() => {
          setLoaded(false);
          setIndex((i) => i + 1);
        }}
        className={`absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-300 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}

export { hostLabel };
