import { useEffect, useRef, useState } from "react";
import { Code2, Github } from "lucide-react";
import Projects from "./Projects";
import GitHubActivity from "./GitHubActivity";

const TABS = [{ id: "projects", label: "Projects" }, { id: "github", label: "GitHub Activity" }];

export default function WorkTabs({ onProjectView, onOpenArchive }) {
  const [active, setActive] = useState("projects");
  const [githubOpened, setGithubOpened] = useState(false);
  const refs = useRef([]);
  const select = (id) => { setActive(id); if (id === "github") setGithubOpened(true); };
  useEffect(() => {
    const navigate = (event) => {
      const id = event.detail;
      if (id !== "projects" && id !== "github") return;
      setActive(id);
      if (id === "github") setGithubOpened(true);
    };
    window.addEventListener("portfolio-work-tab", navigate);
    return () => window.removeEventListener("portfolio-work-tab", navigate);
  }, []);
  const onKeyDown = (event, index) => {
    let next;
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") next = 1 - index;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = 1;
    else return;
    event.preventDefault(); select(TABS[next].id); refs.current[next]?.focus();
  };
  return (
    <section id="projects" className="py-10 md:py-24" aria-label="Projects and GitHub activity">
      <div role="tablist" aria-label="Explore my work" className="grid w-full grid-cols-2 gap-1.5 rounded-2xl border border-[#191528] bg-[#0E0C17] p-1.5 sm:inline-flex sm:w-auto">
        {TABS.map(({ id, label }, index) => <button key={id} ref={element => { refs.current[index] = element; }} type="button" role="tab" id={id + "-tab"} aria-controls={id + "-panel"} aria-selected={active === id} tabIndex={active === id ? 0 : -1} onClick={() => select(id)} onKeyDown={event => onKeyDown(event, index)} className={"flex min-h-[48px] min-w-0 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A8A4FF] sm:px-6 " + (active === id ? "bg-gradient-to-r from-[#7873F5] to-[#EC77AB] text-white" : "text-[#8E8E93] hover:bg-white/5 hover:text-white")}>{id === "github" ? <Github size={17} className="shrink-0" /> : <Code2 size={17} className="shrink-0" />}<span>{label}</span></button>)}
      </div>
      <div id="projects-panel" role="tabpanel" aria-labelledby="projects-tab" hidden={active !== "projects"} tabIndex={0} className="mt-8 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#7873F5]">
        <Projects embedded onProjectView={onProjectView} onOpenArchive={onOpenArchive} />
      </div>
      <div id="github-panel" role="tabpanel" aria-labelledby="github-tab" hidden={active !== "github"} tabIndex={0} className="mt-8 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#7873F5]">
        {githubOpened ? <GitHubActivity embedded /> : null}
      </div>
    </section>
  );
}
