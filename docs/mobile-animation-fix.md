# Mobile Animation Bug — Post-Mortem

**Date Fixed:** February 23, 2026  
**File Affected:** `src/mobile-home.css`

---

## The Problem

All animations on mobile (screens ≤ 640px) were running extremely fast — sections that were supposed to smoothly fade and slide in over `0.65s` appeared to snap in instantly. Background blobs designed to float over `20s` were flickering. Footer float animations (`6–8s`) were a rapid flash.

This only happened on mobile/small screens. Desktop was completely fine.

---

## Root Cause

In `src/mobile-home.css`, inside the `@media (max-width: 640px)` block, there was this rule:

```css
/* ❌ BAD — DO NOT EVER DO THIS */
@media (max-width: 640px) {
  * {
    animation-duration: 0.2s !important;
  }
}
```

**Why this is catastrophic:**
- The `*` selector targets **every element on the page**.
- `!important` means it overrides every other animation duration, no matter what.
- This forced ALL animations — scroll reveals, blob morphs, glow pulses, footer floats — to `0.2s` on mobile, making all of them look instant or jittery.

It was originally added with good intent ("reduce animation intensity on mobile for performance") but had an unintended side effect of destroying all animations.

---

## The Fix

Removed the blanket rule entirely. Mobile performance is handled through targeted, surgical overrides instead:

```css
/* ✅ CORRECT — target only what needs changing */

/* Disable hover transforms on touch devices (not animation-duration) */
@media (hover: none) and (pointer: coarse) {
  .hover\:-translate-y-1:hover { transform: none !important; }
  .hover\:scale-105:hover { transform: none !important; }
}

/* Reduce blur cost on mobile GPUs */
@media (max-width: 768px) {
  .blur-3xl { filter: blur(40px) !important; }
  .blur-xl  { filter: blur(12px) !important; }
}

/* Respect user accessibility preferences */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Rules Going Forward

> ⚠️ **Never use `* { animation-duration: Xs !important }` anywhere in the codebase.**

If a specific animation needs to be slower or faster on mobile, override that **specific class only**:

```css
/* Good — scoped override */
@media (max-width: 640px) {
  .animate-blob {
    animation-duration: 30s;
  }
}

/* Bad — global override */
@media (max-width: 640px) {
  * {
    animation-duration: 0.2s !important; /* ❌ kills everything */
  }
}
```
