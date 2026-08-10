# Apple Store Online

All HTML output (pipeline, skills-guide, prototype, plan, report, etc.) must use this as the visual foundation to keep the UI consistent across the repo.

## Mission
Create implementation-ready, token-driven UI guidance for Apple Store Online that is optimized for consistency, accessibility, and fast delivery across e-commerce storefront.

## Brand
- Product/brand: Apple Store Online
- URL: https://www.apple.com/tw/store
- Audience: online shoppers and consumers
- Product surface: e-commerce storefront

## Style Foundations
- Visual style: clean, functional, implementation-oriented
- Main font style: `font.family.primary=SF Pro TC`, `font.family.stack=SF Pro TC, SF Pro Text, SF Pro Icons, PingFang TC, Helvetica Neue, Helvetica, Arial, sans-serif`, `font.size.base=12px`, `font.weight.base=400`, `font.lineHeight.base=16.0005px`
- Typography scale: `font.size.xs=12px`, `font.size.sm=14px`, `font.size.md=14.04px`, `font.size.lg=17px`, `font.size.xl=18px`, `font.size.2xl=19.89px`, `font.size.3xl=24px`, `font.size.4xl=28px`
- Color palette: `color.text.primary=#1d1d1f`, `color.surface.base=#000000`, `color.text.tertiary=#ffffff`, `color.text.inverse=#424245`, `color.surface.muted=#d2d2d7`, `color.surface.raised=#f5f5f7`
- Spacing scale: `space.1=2px`, `space.2=5.62px`, `space.3=7px`, `space.4=8px`, `space.5=9px`, `space.6=15px`, `space.7=17px`, `space.8=57.88px`
- Radius/shadow/motion tokens: `radius.xs=56px`, `radius.sm=980px` | `motion.duration.instant=320ms`, `motion.duration.fast=500ms`

## Accessibility
- Target: WCAG 2.2 AA
- Keyboard-first interactions required.
- Focus-visible rules required.
- Contrast constraints required.

## Writing Tone
Concise, confident, implementation-focused.

## Rules: Do
- Use semantic tokens, not raw hex values, in component guidance.
- Every component must define states for default, hover, focus-visible, active, disabled, loading, and error.
- Component behavior should specify responsive and edge-case handling.
- Interactive components must document keyboard, pointer, and touch behavior.
- Accessibility acceptance criteria must be testable in implementation.

## Rules: Don't
- Do not allow low-contrast text or hidden focus indicators.
- Do not introduce one-off spacing or typography exceptions.
- Do not use ambiguous labels or non-descriptive actions.
- Do not ship component guidance without explicit state rules.

## Guideline Authoring Workflow
1. Restate design intent in one sentence.
2. Define foundations and semantic tokens.
3. Define component anatomy, variants, interactions, and state behavior.
4. Add accessibility acceptance criteria with pass/fail checks.
5. Add anti-patterns, migration notes, and edge-case handling.
6. End with a QA checklist.

## Required Output Structure
- Context and goals.
- Design tokens and foundations.
- Component-level rules (anatomy, variants, states, responsive behavior).
- Accessibility requirements and testable acceptance criteria.
- Content and tone standards with examples.
- Anti-patterns and prohibited implementations.
- QA checklist.

## Component Rule Expectations
- Include keyboard, pointer, and touch behavior.
- Include spacing and typography token requirements.
- Include long-content, overflow, and empty-state handling.
- Include known page component density: cards (646), links (347), buttons (83), lists (67), navigation (4), inputs (2).

## Quality Gates
- Every non-negotiable rule must use "must".
- Every recommendation should use "should".
- Every accessibility rule must be testable in implementation.
- Teams should prefer system consistency over local visual exceptions.
