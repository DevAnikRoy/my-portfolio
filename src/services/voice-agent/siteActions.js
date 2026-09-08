/**
 * Resolve a spoken project query against PROJECTS list.
 */
export function findProjectByQuery(projects, query = "") {
  const command = String(query).toLowerCase().trim();
  if (!command) return null;
  const cmdNoSpace = command.replace(/\s+/g, "");

  return (
    projects.find((p) => {
      const title = p.title.toLowerCase();
      const bareName = title.replace(/\s*platform$/i, "");
      const words = bareName.split(/\s+/);
      const aliases = (p.aliases || []).map((a) => a.toLowerCase());
      if (
        aliases.some(
          (alias) =>
            command.includes(alias) || cmdNoSpace.includes(alias.replace(/\s+/g, ""))
        )
      ) {
        return true;
      }
      if (command.includes(title) || command.includes(bareName)) return true;
      if (words.length === 1) {
        return command.includes(words[0]) || cmdNoSpace.includes(words[0]);
      }
      if (words.length > 1) {
        const matched = words.filter(
          (w) => w.length > 1 && (command.includes(w) || cmdNoSpace.includes(w))
        );
        return matched.length >= 2;
      }
      return false;
    }) || null
  );
}

const SECTION_IDS = new Set([
  "home",
  "about",
  "skills",
  "education",
  "experience",
  "projects",
  "contact",
]);

/**
 * Execute Sam site actions from /api/chat mode=site.
 */
export function executeSiteActions(actions, ctx) {
  if (!Array.isArray(actions) || !actions.length) return;

  const {
    scrollToSection,
    openUrl,
    openProject,
    goHome,
    backToProjects,
    projects,
  } = ctx;

  for (const action of actions) {
    if (!action || typeof action !== "object") continue;
    const type = action.type;

    if (type === "scrollTo" && SECTION_IDS.has(action.id)) {
      scrollToSection(action.id);
      continue;
    }

    if (type === "scrollPage") {
      const delta = Math.max(280, Math.round(window.innerHeight * 0.7));
      window.dispatchEvent(new Event("close-mobile-nav"));
      window.scrollBy({
        top: action.direction === "up" ? -delta : delta,
        behavior: "smooth",
      });
      continue;
    }

    if (type === "goHome") {
      goHome?.();
      continue;
    }

    if (type === "backToProjects") {
      backToProjects?.();
      continue;
    }

    const project = findProjectByQuery(projects, action.query || "");
    if (!project) continue;

    if (type === "openProject") {
      openProject?.({
        ...project,
        liveUrl: project.live,
        githubUrl: project.git,
      });
      continue;
    }

    if (type === "openLiveDemo") {
      if (project.live) openUrl(project.live);
      continue;
    }

    if (type === "openGithub") {
      const gitUrl = project.git || project.githubUrl;
      if (gitUrl) openUrl(gitUrl);
      else if (project.live) openUrl(project.live);
    }
  }
}
