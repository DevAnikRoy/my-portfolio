import { load } from "cheerio";

const USERNAME = "DevAnikRoy";
const API = "https://api.github.com";
const headers = { "Content-Type": "application/json", "Cache-Control": "public, max-age=60", "Netlify-CDN-Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600" };

async function github(path, token, body) {
  const response = await fetch(API + path, {
    method: body ? "POST" : "GET",
    headers: { Accept: "application/vnd.github+json", "User-Agent": "Anik-Roy-Portfolio", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body ? { "Content-Type": "application/json" } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error("GitHub request failed");
  const data = await response.json();
  if (data.errors) throw new Error("GitHub query failed");
  return data;
}

function liveUrl(value) {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : null;
  } catch { return null; }
}


async function publicCalendar(year) {
  const response = await fetch(`https://github.com/users/${USERNAME}/contributions?from=${year}-01-01&to=${year}-12-31`, { headers: { "User-Agent": "Anik-Roy-Portfolio" }, signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error("Calendar unavailable");
  const $ = load(await response.text());
  const tips = new Map();
  $("tool-tip[for]").each((_, element) => tips.set($(element).attr("for"), $(element).text().trim()));
  const days = new Map();
  const levels = ["NONE", "FIRST_QUARTILE", "SECOND_QUARTILE", "THIRD_QUARTILE", "FOURTH_QUARTILE"];
  $("[data-date][data-level]").each((_, element) => {
    const date = $(element).attr("data-date");
    if (!date?.startsWith(String(year))) return;
    const tip = tips.get($(element).attr("id")) || "";
    const count = /^No contributions/i.test(tip) ? 0 : Number(tip.match(/^([\d,]+) contributions?\b/i)?.[1]?.replaceAll(",", ""));
    const level = Number($(element).attr("data-level"));
    if (!Number.isFinite(count) || !levels[level]) throw new Error("Unrecognized calendar markup");
    days.set(date, { date, weekday: new Date(date + "T00:00:00Z").getUTCDay(), contributionCount: count, contributionLevel: levels[level] });
  });
  const first = new Date(Date.UTC(year, 0, 1));
  const last = new Date(Date.UTC(year, 11, 31));
  const expected = Math.round((last - first) / 86400000) + 1;
  if (days.size !== expected) throw new Error("Incomplete calendar");
  const weeks = [];
  let totalContributions = 0;
  for (let day = new Date(first); day <= last; day.setUTCDate(day.getUTCDate() + 1)) {
    const item = days.get(day.toISOString().slice(0, 10));
    if (!weeks.length || item.weekday === 0) weeks.push({ contributionDays: [] });
    weeks.at(-1).contributionDays.push(item);
    totalContributions += item.contributionCount;
  }
  return { totalContributions, weeks };
}

async function contributionCalendar(token, year, from, to) {
  if (token) {
    try {
      const data = await github("/graphql", token, {
        query: "query($login:String!,$from:DateTime!,$to:DateTime!){user(login:$login){contributionsCollection(from:$from,to:$to){contributionCalendar{totalContributions weeks{contributionDays{date weekday contributionCount contributionLevel}}}}}}",
        variables: { login: USERNAME, from, to },
      });
      const calendar = await publicCalendar(year);
      // Public graph includes the remaining months; authenticated totals can include restricted activity.
      return { ...calendar, ...data.data.user.contributionsCollection.contributionCalendar };
    } catch { /* Use the public profile calendar when authentication is unavailable. */ }
  }
  return publicCalendar(year).catch(() => null);
}

export const handler = async (event) => {
  if (event.httpMethod !== "GET") return { statusCode: 405, headers: { "Content-Type": "application/json", Allow: "GET" }, body: JSON.stringify({ error: "Method not allowed" }) };
  const token = process.env.GITHUB_TOKEN;
  const year = new Date().getUTCFullYear();
  const from = `${year}-01-01T00:00:00Z`;
  const to = `${year}-12-31T23:59:59Z`;
  const contributions = contributionCalendar(token, year, from, to);
  try {
    const [profile, repositories, calendar] = await Promise.all([
      github(`/users/${USERNAME}`, token),
      (async () => {
        const selected = [];
        // Paginate until six original, active repositories have been found.
        for (let page = 1; page <= 10 && selected.length < 6; page++) {
          const batch = await github(`/users/${USERNAME}/repos?type=owner&sort=created&direction=desc&per_page=100&page=${page}`, token);
          selected.push(...batch.filter(repo => !repo.fork && !repo.archived));
          if (batch.length < 100) break;
        }
        return selected.slice(0, 6).map(repo => ({ id: repo.id, name: repo.name, description: repo.description, url: repo.html_url, liveUrl: liveUrl(repo.homepage), language: repo.language, stars: repo.stargazers_count, forks: repo.forks_count, updatedAt: repo.pushed_at }));
      })(),
      contributions,
    ]);
    return { statusCode: 200, headers, body: JSON.stringify({ username: USERNAME, name: profile.name || USERNAME, avatar: profile.avatar_url, url: profile.html_url, publicRepos: profile.public_repos, followers: profile.followers, year, calendar, repositories, fetchedAt: new Date().toISOString() }) };
  } catch {
    return { statusCode: 503, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }, body: JSON.stringify({ error: "GitHub activity is temporarily unavailable." }) };
  }
};
