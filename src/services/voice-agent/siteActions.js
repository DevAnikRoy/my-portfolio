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
 * Execute Tia site actions from /api/chat mode=site.
 * Off-home views (project details, archive) cannot scrollTo a section that
 * is not mounted — those commands first return to the homepage.
 */
export function executeSiteActions(actions, ctx) {
  if (!Array.isArray(actions) || !actions.length) return;

  const {
    scrollToSection,
    openUrl,
    openProject,
    goHome,
    backToProjects,
    openWebflowArchive,
    navigateHomeTo,
    currentView,
    projects,
    openAudit,
    openChat,
    endCall,
  } = ctx;

  const view = currentView || "home";
  const goToSection = (id) => {
    if (view === "home") {
      scrollToSection(id);
      return;
    }
    if (typeof navigateHomeTo === "function") {
      navigateHomeTo(id);
      return;
    }
    goHome?.();
    window.setTimeout(() => scrollToSection?.(id), 120);
  };

  for (const action of actions) {
    if (!action || typeof action !== "object") continue;
    const type = action.type;

    if (type === "scrollTo" && SECTION_IDS.has(action.id)) {
      goToSection(action.id);
      continue;
    }

    if (type === "scrollPage") {
      if (view !== "home") {
        goToSection("projects");
        continue;
      }
      const delta = Math.max(280, Math.round(window.innerHeight * 0.7));
      window.dispatchEvent(new Event("close-mobile-nav"));
      window.scrollBy({
        top: action.direction === "up" ? -delta : delta,
        behavior: "smooth",
      });
      continue;
    }

    if (type === "goHome") {
      goToSection("home");
      continue;
    }

    if (type === "backToProjects") {
      if (view === "project-detail") {
        backToProjects?.();
      } else if (view === "webflow-work") {
        goToSection("projects");
      } else {
        scrollToSection?.("projects");
      }
      continue;
    }

    if (type === "openWebflowArchive") {
      openWebflowArchive?.();
      continue;
    }

    if (type === "openResume") {
      openUrl?.("/resume.pdf");
      continue;
    }

    if (type === "openAudit") {
      openAudit?.();
      continue;
    }

    if (type === "openChat") {
      openChat?.();
      continue;
    }

    if (type === "endCall") {
      endCall?.();
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
