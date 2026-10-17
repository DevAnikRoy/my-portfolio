# GitHub Activity

The homepage loads `/api/github-profile` through the existing Netlify functions redirect. It displays DevAnikRoy’s public repository count, followers, current UTC calendar-year contributions, and six newest public, non-fork, non-archived repositories. Repository cards are separate from curated case studies.

## Setup

Set `GITHUB_TOKEN` in Netlify environment variables for Functions, then deploy. Use a GitHub token with access to the GraphQL user contribution query; public activity does not require repository write permissions. Never put the token in frontend code or a `VITE_` variable. Without a token, the calendar is read from the public GitHub profile contribution page. This is a fallback based on GitHub HTML markup; authenticated GraphQL remains preferred. If GitHub changes that markup, the calendar shows an unavailable state rather than invented counts. Private contribution visibility depends on GitHub profile settings and token permissions; private repository details are never returned by this endpoint.

For local API testing use Netlify Dev, which reads a local untracked `.env` file. Plain Vite serves only the frontend and cannot execute Netlify Functions.

## Refresh

Netlify CDN caches responses for 15 minutes and can serve stale responses while revalidating for up to one hour. The browser refreshes every 15 minutes while visible, and when returning to the page. Updates require no rebuild once deployed, but GitHub processing and caching can delay visibility. Failed refreshes preserve the last loaded frontend data. No fabricated contribution counts are displayed.
