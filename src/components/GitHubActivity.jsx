import { useEffect, useState } from "react";
import {
  Github,
  ArrowUpRight,
  Star,
  GitFork,
  ExternalLink,
} from "lucide-react";

const PROFILE = "https://github.com/DevAnikRoy";
const COLORS = {
  NONE: "#211C32",
  FIRST_QUARTILE: "#40366C",
  SECOND_QUARTILE: "#6552AC",
  THIRD_QUARTILE: "#8A73E6",
  FOURTH_QUARTILE: "#EC77AB",
};
const REFRESH = 15 * 60 * 1000;
const LINK =
  "inline-flex items-center gap-2 text-sm text-[#A8A4FF] transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#7873F5]";

function Calendar({ calendar, year }) {
  const weeks = calendar.weeks;
  return (
    <div className="mt-6 rounded-2xl border border-[#191528] bg-[#0E0C17] p-4 sm:p-6">
      <p className="mb-4 text-sm text-[#8E8E93]">
        {calendar.totalContributions.toLocaleString()} contributions in {year}
      </p>
      <div
        className="overflow-x-auto pb-2"
        tabIndex={0}
        aria-label={`Contribution calendar for ${year}. Scroll horizontally to see all dates.`}
      >
        <svg
          width={Math.max(weeks.length * 14 + 32, 100)}
          height="130"
          role="img"
          aria-label={`${calendar.totalContributions} GitHub contributions in ${year}`}
        >
          <text x="0" y="49" fill="#8E8E93" fontSize="9">
            Mon
          </text>
          <text x="0" y="77" fill="#8E8E93" fontSize="9">
            Wed
          </text>
          <text x="0" y="105" fill="#8E8E93" fontSize="9">
            Fri
          </text>
          {weeks.map((week, index) => {
            const monthDay = week.contributionDays.find((day) =>
              day.date.endsWith("-01"),
            );
            return (
              <g key={week.contributionDays[0].date}>
                {monthDay ? (
                  <text x={index * 14 + 32} y="12" fill="#8E8E93" fontSize="9">
                    {new Date(monthDay.date + "T00:00:00Z").toLocaleDateString(
                      "en",
                      { month: "short", timeZone: "UTC" },
                    )}
                  </text>
                ) : null}
                {week.contributionDays
                  .filter((day) => day.date.startsWith(String(year)))
                  .map((day) => (
                    <rect
                      key={day.date}
                      x={index * 14 + 32}
                      y={day.weekday * 14 + 24}
                      width="10"
                      height="10"
                      rx="2"
                      fill={COLORS[day.contributionLevel] || COLORS.NONE}
                    >
                      <title>
                        {day.date}: {day.contributionCount} contributions
                      </title>
                    </rect>
                  ))}
              </g>
            );
          })}
        </svg>
      </div>
      <div className="mt-3 flex items-center justify-end gap-1.5 text-xs text-[#8E8E93]">
        <span className="mr-1">Less</span>
        {Object.entries(COLORS).map(([level, color]) => (
          <span
            key={level}
            className="h-2.5 w-2.5 rounded-sm"
            style={{ backgroundColor: color }}
          />
        ))}
        <span className="ml-1">More</span>
      </div>
    </div>
  );
}

export default function GitHubActivity({ embedded = false }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let disposed = false;
    let controller;
    let busy = false;
    const refresh = async () => {
      if (busy || document.visibilityState === "hidden") return;
      busy = true;
      controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      try {
        const response = await fetch("/api/github-profile", {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Unavailable");
        const result = await response.json();
        if (
          !Array.isArray(result.repositories) ||
          typeof result.publicRepos !== "number"
        )
          throw new Error("Invalid response");
        if (!disposed) {
          setData(result);
          setFailed(false);
        }
      } catch {
        if (!disposed) setFailed(true);
      } finally {
        clearTimeout(timeout);
        busy = false;
        if (!disposed) setLoading(false);
      }
    };
    void refresh();
    const interval = setInterval(refresh, REFRESH);
    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      disposed = true;
      controller?.abort();
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [retry]);

  return (
    <section
      id="github"
      className={embedded ? "" : "py-10 md:py-24"}
      aria-labelledby="github-heading"
      aria-busy={loading}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#A8A4FF]">
            Code & contributions
          </p>
          <h2 id="github-heading" className="text-3xl font-bold">
            GitHub Activity
          </h2>
          <p className="mt-3 text-sm text-[#8E8E93] md:text-base">
            What I’m building, straight from GitHub.
          </p>
        </div>
        <a
          className={LINK + " mt-2"}
          href={PROFILE}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Github size={18} /> @DevAnikRoy <ArrowUpRight size={16} />
        </a>
      </div>
      {loading ? (
        <div
          className="mt-6 h-56 animate-pulse rounded-3xl border border-[#191528] bg-[#0E0C17]"
          role="status"
        >
          <span className="sr-only">Loading GitHub activity</span>
        </div>
      ) : null}
      {failed ? (
        <p role="status" className="mt-6 text-sm text-[#8E8E93]">
          {data
            ? "Showing the last loaded activity. GitHub refresh is temporarily unavailable."
            : "GitHub activity is temporarily unavailable."}{" "}
          <button
            type="button"
            onClick={() => setRetry((value) => value + 1)}
            className="ml-2 text-[#A8A4FF] underline"
          >
            Try again
          </button>
        </p>
      ) : null}
      {data ? (
        <>
          <div className="mt-6 flex flex-wrap items-center gap-6 rounded-3xl border border-[#191528] bg-[#0E0C17]/80 p-5 sm:p-7">
            <a
              href={data.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3"
            >
              <img
                src={data.avatar}
                alt=""
                width="48"
                height="48"
                loading="lazy"
                className="rounded-full"
              />
              <div>
                <p className="font-semibold">{data.name}</p>
                <p className="text-xs text-[#8E8E93]">@{data.username}</p>
              </div>
            </a>
            <div className="flex flex-wrap gap-6 sm:ml-auto">
              <div>
                <p className="grad-text text-2xl font-bold">
                  {data.publicRepos}
                </p>
                <p className="text-xs text-[#8E8E93]">Public repositories</p>
              </div>
              <div>
                <p className="grad-text text-2xl font-bold">
                  {data.calendar
                    ? data.calendar.totalContributions.toLocaleString()
                    : "—"}
                </p>
                <p className="text-xs text-[#8E8E93]">
                  Contributions in {data.year}
                </p>
              </div>
              <div>
                <p className="grad-text text-2xl font-bold">{data.followers}</p>
                <p className="text-xs text-[#8E8E93]">Followers</p>
              </div>
            </div>
          </div>
          {data.calendar ? (
            <Calendar calendar={data.calendar} year={data.year} />
          ) : (
            <p className="mt-5 text-sm text-[#8E8E93]">
              Contribution calendar is currently unavailable.{" "}
              <a
                href={PROFILE}
                className="text-[#A8A4FF] underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                View activity on GitHub
              </a>
            </p>
          )}
          <div className="mb-5 mt-8 flex items-center justify-between gap-4">
            <h3 className="text-lg font-semibold">Latest repositories</h3>
            <a
              href={PROFILE + "?tab=repositories"}
              className={LINK}
              target="_blank"
              rel="noopener noreferrer"
            >
              View all <ArrowUpRight size={16} />
            </a>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {data.repositories.map((repo) => (
              <article
                key={repo.id}
                className="flex flex-col rounded-3xl border border-[#191528] bg-[#0E0C17]/80 p-5 transition-colors hover:border-[#7873F5]/50 sm:p-6"
              >
                <a
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 font-semibold hover:text-[#A8A4FF]"
                >
                  <Github
                    size={18}
                    className="mt-0.5 shrink-0 text-[#A8A4FF]"
                  />
                  <span className="min-w-0 break-words">{repo.name}</span>
                  <ArrowUpRight
                    size={16}
                    className="ml-auto shrink-0 text-[#8E8E93]"
                  />
                </a>
                <p className="mb-5 mt-3 text-sm leading-relaxed text-[#8E8E93]">
                  {repo.description ||
                    "Explore the source code and latest updates on GitHub."}
                </p>
                <div className="mt-auto flex flex-wrap items-center gap-4 text-xs text-[#8E8E93]">
                  {repo.language ? (
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#7873F5]" />
                      {repo.language}
                    </span>
                  ) : null}
                  <span
                    className="flex items-center gap-1"
                    aria-label={repo.stars + " stars"}
                  >
                    <Star size={13} />
                    {repo.stars}
                  </span>
                  <span
                    className="flex items-center gap-1"
                    aria-label={repo.forks + " forks"}
                  >
                    <GitFork size={13} />
                    {repo.forks}
                  </span>
                  {repo.liveUrl ? (
                    <a
                      className={LINK + " ml-auto text-xs"}
                      href={repo.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Live demo <ExternalLink size={13} />
                    </a>
                  ) : null}
                </div>
                {repo.updatedAt ? (
                  <p className="mt-4 text-[11px] text-[#8E8E93]">
                    Updated{" "}
                    {new Date(repo.updatedAt).toLocaleDateString("en", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
          {data.repositories.length === 0 ? (
            <p className="text-sm text-[#8E8E93]">
              No public repositories to show yet.
            </p>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
