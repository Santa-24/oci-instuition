# OCI Existing Codebase & Change Control Rules

You are working on an **existing OCI website codebase** (`Odisha Competitive Institute`).

From this point forward, whenever a new feature, modification, bug fix, UI change, content update, or enhancement is requested, you MUST modify the existing codebase intelligently instead of rebuilding or expanding the project unnecessarily.

---

## 1. DO NOT REBUILD THE PROJECT
NEVER rebuild the entire application, rewrite existing pages unnecessarily, replace the existing architecture without a clear reason, or create duplicate pages, components, styles, or utilities. Always inspect existing code first and make the smallest necessary change.

## 2. ADD ONLY WHAT IS REQUESTED
Implement only the requested feature and the minimum supporting changes required for it to work. Do not add speculative extra pages, sections, animations, packages, or components.

## 3. INSPECT BEFORE MODIFYING
Before changing anything:
1. Inspect the existing project structure.
2. Identify the relevant page/component.
3. Identify existing reusable components, utilities, and styles.
4. Prefer modifying an existing file over creating a new file when practical.

## 4. FILE CREATION RULE
Order of preference:
1. Reuse existing file
2. Modify existing component
3. Create a new component only if necessary
4. Create a new file only when genuinely required

## 5. DO NOT CREATE UNUSED CODE OR SPECULATIVE FEATURES
Never generate unused components, functions, hooks, interfaces, or placeholder services.

## 6. DO NOT ADD DEPENDENCIES UNNECESSARILY
Check if an existing library can accomplish the requirement before installing any new package.

## 7. PRESERVE THE EXISTING DESIGN SYSTEM & TECHNOLOGY
- Reuse the existing OCI color palette (Deep Navy, Royal Blue/Indigo, Warm Gold, Soft Ivory), typography (Plus Jakarta Sans & JetBrains Mono), spacing, and component variants.
- Do not change Next.js, TypeScript, Tailwind CSS, shadcn/ui, or Framer Motion setup.

## 8. PRESERVE EXISTING FUNCTIONALITY & RESPONSIVENESS
Do not break existing navigation, responsive layouts, forms, SEO, accessibility, or pages.

## 9. DO NOT DUPLICATE COMPONENTS OR PAGES
Reuse existing components (`Button`, `Navbar`, `Footer`, `OciLogo`, `PageHeader`) and routes. Extend existing components when appropriate.

## 10. MINIMAL CODE CHANGE PRINCIPLE
Implement the smallest change that correctly solves the requested problem.

## 11. NO FAKE BACKEND OR FAKE CONTENT
Use only verified information supplied by OCI. Never fabricate students, results, reviews, awards, or statistics.

## 12. KEEP CONTENT DATA-DRIVEN
Update existing data files (`data/site.ts`, `data/exams.ts`, `data/why-oci.ts`, `data/about.ts`, `data/app-features.ts`) instead of hardcoding redundant data.

## 13. CHANGE SUMMARY FORMAT
After each implementation, provide a concise summary containing:
- **Changed**: Files/components actually modified.
- **Added**: Genuinely new files (if any).
- **Dependencies**: Newly added packages (if any).
- **Unchanged**: Confirmation that unrelated functionality was preserved.
