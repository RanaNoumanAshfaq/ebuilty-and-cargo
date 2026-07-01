# KHAN TOURISM — Build Plan

## Phase 0 — Architecture + cleanup
- [x] Inspect and refactor `src/App.jsx` to use page components from `src/pages/*` (single source of truth)
- [x] Remove/stop using duplicated inline mock pages currently embedded in `src/App.jsx`
- [ ] Ensure navigation links match actual routes
- [ ] Smoke-test routing locally (dev server) 


## Phase 1 — Landing page
- [ ] Upgrade `src/pages/Home.jsx` and/or add landing section components to match the requested hero + sections

## Phase 2 — Vehicle management
- [ ] Build vehicle gallery listing + filters
- [ ] Add vehicle details page with rich specs

## Phase 3 — Tour packages + booking inquiry
- [ ] Build tours listing + tour detail page
- [ ] Implement inquiry flow (frontend MVP)

## Phase 4 — Auth + verification + profile
- [ ] Add login/register/forgot/password reset pages (frontend)
- [ ] Add verification upload UI + status

## Phase 5 — Backend + admin dashboard
- [ ] Create Node/Express/MongoDB backend structure
- [ ] Implement admin APIs and admin dashboard UI

## Phase 6 — Payments + notifications + maps
- [ ] Add payment UI + backend integration (start with Stripe)
- [ ] Add notifications + maps + driver tracking MVP

## Phase 7 — UX polish + multilingual + premium features
- [ ] Implement i18n structure
- [ ] Add animation/loading skeletons/back-to-top

