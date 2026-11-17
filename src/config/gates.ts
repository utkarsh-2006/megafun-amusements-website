/**
 * Publication thresholds — the v0.3 brief §6 working defaults.
 * Every numeric gate in the site reads from this object; nothing else hard-codes a count.
 * Change a value here only after the owner approves the new threshold (record it in
 * docs/COMPANY_FACTS_TO_CONFIRM.md → "Structural decisions").
 */
export const gates = {
  /** Attraction detail page: ≥2 approved stills, OR ≥1 approved video plus ≥1 poster/still. */
  attraction: { minStills: 2, minVideos: 1, minStillsWithVideo: 1 },
  /** Category page: ≥3 active, publishable attractions with this as primary category. */
  category: { minAttractions: 3 },
  /** Solution page: ≥3 suitable attractions across ≥2 primary categories, AND ≥1 related project OR ≥3 verified planning points. */
  solution: { minAttractions: 3, minPrimaryCategories: 2, minRelatedProjects: 1, minPlanningPoints: 3 },
  /** Solutions index + nav: ≥2 venue pages pass independently. */
  solutionsNav: { minPages: 2 },
  /** Projects archive + nav: ≥3 approved showcase-grade records (case studies count, they include showcase requirements). */
  projects: { minShowcases: 3, minMediaPerShowcase: 1 },
  /** Case study page: ≥3 approved media items, plus the Projects archive must be live. */
  caseStudy: { minMedia: 3 },
  /** A project filter value is offered only when ≥2 published projects match it. */
  projectFilter: { minMatches: 2 },
  /** Homepage Selected Work when the archive is not live: show at most this many. */
  selectedWork: { maxWithoutArchive: 2, maxWithArchive: 3 },
  /** Kept for reporting; /updates/ always exists (owner decision) and shows an empty state below this. */
  newsIndex: { minArticles: 1 },
  /** Homepage Latest News: ≥2 articles within 180 days and the newest ≤90 days old. */
  homeNews: { minArticles: 2, windowDays: 180, newestMaxAgeDays: 90, show: 3 },
  /** Credentials page: ≥2 current credentials approved for public display. */
  credentials: { minCurrent: 2 },
  /** Turnkey & Engineering always exists (top-level nav); below this it shows a "being confirmed" state. */
  turnkey: { minCapabilities: 1 },
} as const;

export type Gates = typeof gates;
