# Framework7 v9 Development Guidelines

**Version**: 9.x  
**Author**: Development Team  
**Last Updated**: February 7, 2026

> **Purpose**: This document provides comprehensive, reusable development guidelines for Framework7 v9 applications. These patterns, best practices, and standards can be applied to any Framework7 project.

---

## Table of Contents

1. [Framework7 v9 Core Concepts](#framework7-v9-core-concepts)
2. [Template Syntax Rules](#template-syntax-rules)
3. [HTML/JSX Syntax Rules](#htmljsx-syntax-rules)
4. [Material Icons Usage](#material-icons-usage)
5. [Coding Standards & Design System](#coding-standards--design-system)
6. [Centralized Styling Architecture](#centralized-styling-architecture)
7. [Reusable .f7 Components](#reusable-f7-components)
8. [File Organization](#file-organization)
9. [Best Practices](#best-practices)

---

## Framework7 v9 Core Concepts

When developing with Framework7 v9, always follow the official documentation and best practices. Refer to these essential resources:

### Core Concepts
- **Events**: https://framework7.io/docs/events
- **Routes**: https://framework7.io/docs/routes
- **Router Component**: https://framework7.io/docs/router-component
- **View**: https://framework7.io/docs/view
- **Store**: https://framework7.io/docs/store
- **App**: https://framework7.io/docs/app
- **Package**: https://framework7.io/docs/package

### Layout & Styling
- **App Layout**: https://framework7.io/docs/app-layout
- **Init App**: https://framework7.io/docs/init-app
- **Safe Areas**: https://framework7.io/docs/safe-areas
- **Color Themes**: https://framework7.io/docs/color-themes
- **Typography**: https://framework7.io/docs/typography
- **CSS Variables**: https://framework7.io/docs/css-variables
- **Theme-Based Rendering**: https://framework7.io/docs/theme-based-rendering

### UI Components
- **Framework7 Components**: https://framework7.io/docs/
- Complete list of 50+ components available at [Framework7 Docs](https://framework7.io/docs/)
- **Framework7 Icons**: https://framework7.io/icons/

### Utilities & APIs
- **DOM7**: https://framework7.io/docs/dom7
- **Active State**: https://framework7.io/docs/active-state
- **Utils**: https://framework7.io/docs/utils
- **Device**: https://framework7.io/docs/device
- **Support**: https://framework7.io/docs/support

### Advanced Features
- **Plugins API**: https://framework7.io/docs/plugins-api
- **Lazy Modules**: https://framework7.io/docs/lazy-modules
- **Custom Build**: https://framework7.io/docs/custom-build

### Key Development Practices

1. **Always use Framework7 Router Components (.f7 files)** for page structure
2. **Leverage Framework7 Store** for state management across the app
3. **Follow Framework7's event system** for component communication
4. **Use Framework7's built-in color theme system** with CSS variables
5. **Implement proper safe area handling** for modern devices
6. **Use DOM7 for DOM manipulation** instead of jQuery
7. **Follow Framework7's app initialization patterns**
8. **Utilize lazy loading** for better performance
9. **Support both light and dark mode themes** with proper CSS variable usage
10. **Use `.theme-dark` class** for dark mode specific styles
11. **Always wrap array mappings with `$h` tagged template literals** in templates
12. **Never use plain template literals for array rendering** - use `$h\`...\`` pattern

---

## Template Syntax Rules

Framework7 uses **tagged template literals** with the `$h` function for proper virtual DOM rendering. This is critical for arrays and dynamic content.

### CRITICAL: Array Mapping Syntax

**✅ CORRECT - Always use `$h` wrapper for array mappings:**
```javascript
${items.map((item) => $h`
  <li>${item.name}</li>
`)}
```

**❌ INCORRECT - Never use plain template literals for arrays:**
```javascript
// This will render as TEXT, not HTML
${items.map((item) => `
  <li>${item.name}</li>
`)}
```

**Why?** Framework7's virtual DOM engine requires `$h` tagged template literals to properly process and render HTML elements. Without `$h`, the entire HTML renders as plain text strings visible in the UI.

### Conditional Rendering

**✅ Ternary operators with `$h`:**
```javascript
${condition ? $h`<div>True content</div>` : $h`<div>False content</div>`}
```

**✅ Logical AND with `$h`:**
```javascript
${isVisible && $h`<div>Visible content</div>`}
```

### Complex Lists with Keys

For lists that may reorder or change, always include unique `key` attributes:
```javascript
${items.map((item, idx) => $h`
  <li key=${item.id || idx}>
    <span>${item.name}</span>
  </li>
`)}
```

### Nested Templates

When mapping over nested data, wrap each level with `$h`:
```javascript
${groups.map((group) => $h`
  <div class="group">
    <h3>${group.title}</h3>
    <ul>
      ${group.items.map((item) => $h`
        <li>${item.name}</li>
      `)}
    </ul>
  </div>
`)}
```

### Event Handlers in Templates

Always use function references (not string names) with `@` syntax:
```javascript
<button @click=${handleClick}>Click Me</button>
// ✅ Correct - function reference

<button @click="handleClick">Click Me</button>
// ❌ Incorrect - string name won't work
```

### Inline Arrow Functions for Events

Use arrow functions for inline event handlers with parameters:
```javascript
// Navigation with inline arrow function
<a href="#" @click=${() => setFilter('all')}>Filter</a>

// Event with parameter
<button @click=${(e) => editItem(e, item.id)}>Edit</button>

// Input events
<input @input=${(e) => updateField('name', e.target.value)} />

// Prevent default
<a href="#" @click=${(e) => { e.preventDefault(); handleClick(); }}>Link</a>
```

### Common Anti-Patterns to Avoid

| ❌ Don't Do | ✅ Do Instead |
|------------|--------------|
| `${array.map(i => \`<li>${i}</li>\`)}` | `${array.map(i => $h\`<li>${i}</li>\`)}` |
| `${condition && \`<div>text</div>\`}` | `${condition && $h\`<div>text</div>\`}` |
| Helper function returns plain string | Helper function wrapped in template, mapping in template with `$h` |
| `innerHTML` for dynamic lists | Array mapping with `$h` template literals |
| Nested conditionals in template | Move logic to script, use helper functions |

### Reference Documentation

See official Framework7 Router Component documentation:
- https://framework7.io/docs/router-component#mapping-array-to-elements
- https://framework7.io/docs/router-component#component-template
- https://framework7.io/docs/router-component#virtual-dom

---

## HTML/JSX Syntax Rules

### Asset Import Rules

**CRITICAL**: Always import images and videos using ES6 import statements. Never use direct paths in src attributes.

```javascript
// ✅ CORRECT: Import assets
import logoWhite from '../assets/images/logo-white.png';
import heroVideo from '../assets/videos/hero-bg.mp4';

// Use in template
<img src="${logoWhite}" alt="Logo" />
<video src="${heroVideo}"></video>
```

```html
<!-- ❌ INCORRECT: Direct path in src -->
<img src="assets/images/logo-white.png" alt="Logo" />
<video src="assets/videos/hero-bg.mp4"></video>
```

**Why Import Assets:**
1. **Build Optimization** - Vite/Webpack can optimize, compress, and cache-bust assets
2. **Type Safety** - Import errors caught at build time, not runtime
3. **Path Resolution** - No broken links from incorrect relative paths
4. **Hot Module Replacement** - Asset changes reload instantly during development
5. **Production URLs** - Automatic CDN/hashed filenames for production builds

### Self-Closing Tags

Always use proper self-closing tag syntax with `/` before the closing `>` for void elements.

```html
<!-- ✅ CORRECT: Self-closing tags with / -->
<img src="path/to/image.jpg" alt="Description" />
<input type="text" placeholder="Enter text" />
<source src="video.mp4" type="video/mp4" />
<br />
<hr />
<meta name="description" content="Description" />
<link rel="stylesheet" href="styles.css" />

<!-- ❌ INCORRECT: Missing / before > -->
<img src="path/to/image.jpg" alt="Description">
<input type="text" placeholder="Enter text">
<source src="video.mp4" type="video/mp4">
```

**Void Elements Requiring Self-Closing Syntax:**
- `<img />`
- `<input />`
- `<br />`
- `<hr />`
- `<meta />`
- `<link />`
- `<source />`
- `<area />`
- `<base />`
- `<col />`
- `<embed />`
- `<param />`
- `<track />`
- `<wbr />`

**Container Elements (Normal closing):**
```html
<!-- ✅ CORRECT: Normal closing tags for container elements -->
<div></div>
<span></span>
<button></button>
<a></a>
<p></p>
```

---

## Material Icons Usage

**RECOMMENDED**: Use Material Icons for all icon elements for consistency and better cross-platform support.

### Icon Implementation

**✅ CORRECT - Material Icons syntax:**
```html
<!-- Material Icons with proper class structure -->
<i class="icon material-icons">home</i>
<i class="icon material-icons">camera</i>
<i class="icon material-icons">person</i>
<i class="icon material-icons">settings</i>
```

**❌ INCORRECT - Framework7 Icons (avoid for consistency):**
```html
<!-- Framework7 Icons - use only if required -->
<i class="icon f7-icons">house_fill</i>
<i class="icon f7-icons">camera_fill</i>
```

### Common Material Icons

**Navigation Icons:**
- `home` - Home/Dashboard
- `menu` - Menu
- `arrow_back` - Back navigation
- `more_vert` - More options (vertical dots)
- `more_horiz` - More options (horizontal dots)

**Action Icons:**
- `add` - Add new item
- `edit` - Edit
- `delete` - Delete
- `save` - Save
- `cancel` or `close` - Cancel/Close
- `search` - Search
- `filter_list` - Filter

**Status Icons:**
- `check_circle` - Success
- `cancel` - Error
- `warning` - Warning
- `info` - Information
- `notifications` - Notifications

**File & Data Icons:**
- `upload_file` - Import
- `download` - Export/Download
- `cloud_upload` - Cloud backup
- `folder` - Files
- `description` - Documents

### Icon Sizing

Use Material Icons sizing classes for consistent icon sizes:

```html
<!-- Small icons (18px) -->
<i class="icon material-icons md-18">home</i>

<!-- Default icons (24px) -->
<i class="icon material-icons">home</i>

<!-- Medium icons (36px) -->
<i class="icon material-icons md-36">home</i>

<!-- Large icons (48px) -->
<i class="icon material-icons md-48">home</i>
```

### Icon Colors

Use CSS classes or inline styles for icon colors:

```html
<!-- Using utility classes -->
<i class="icon material-icons color-primary">check_circle</i>
<i class="icon material-icons color-red">cancel</i>
<i class="icon material-icons color-white">home</i>

<!-- Using CSS variables -->
<i class="icon material-icons" style="color: var(--f7-theme-color)">check_circle</i>
```

### Dynamic Icons (Conditional)

Use ternary operators for state-based icons:

```html
<!-- Toggle example -->
<i class="icon material-icons">${isOn ? 'toggle_on' : 'toggle_off'}</i>

<!-- Active state example -->
<i class="icon material-icons">${isActive ? 'check_circle' : 'radio_button_unchecked'}</i>
```

### Icon Buttons

Combine icons with buttons properly:

```html
<!-- Icon-only button -->
<button class="button button-fill">
  <i class="icon material-icons">add</i>
</button>

<!-- Button with icon and text -->
<button class="button button-fill">
  <i class="icon material-icons">save</i>
  <span>Save</span>
</button>

<!-- Toolbar/navbar icons -->
<a href="#" class="link icon-only">
  <i class="icon material-icons">more_vert</i>
</a>
```

### Setup Requirements

Ensure Material Icons are properly loaded in your app:

```html
<!-- In index.html or main layout -->
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
```

Or via CSS import:

```css
/* In main CSS file */
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');
```

### Material Icons Resources

- **Icon Search**: https://fonts.google.com/icons
- **Material Design Guidelines**: https://material.io/design/iconography
- **Icon Names Reference**: https://material.io/resources/icons/

---

## Coding Standards & Design System

### Centralized Styling Approach

**IMPORTANT**: Always use centralized styling through CSS variables and reusable classes defined in `app.less`. Never use inline styles or hardcoded values.

### CSS Variables Usage

Define color palette and theme variables in `app.less` root:

```css
:root {
  /* Primary theme color */
  --f7-theme-color: #007aff;
  
  /* Custom color palette */
  --app-primary: #007aff;
  --app-secondary: #5856d6;
  --app-accent: #ff9500;
  --app-success: #4cd964;
  --app-warning: #ff9500;
  --app-error: #ff3b30;
  --app-info: #5ac8fa;
  
  /* Background colors */
  --app-bg: #ffffff;
  --app-bg-dark: #1a1a1a;
}
```

**Example - Correct vs Incorrect:**
```css
/* ✅ CORRECT */
color: var(--app-primary);
background: var(--app-secondary);

/* ❌ INCORRECT */
color: #007aff;
background: #5856d6;
```

### Golden Ratio Design System (φ ≈ 1.618)

All sizing, spacing, and typography follow the golden ratio for harmonious design.

#### Typography Scale (Golden Ratio: 1.618)
```css
:root {
  /* Base: 16px, Scale: ×1.618 */
  --font-xs: 10px;      /* Base ÷ φ² */
  --font-sm: 13px;      /* Base ÷ φ */
  --font-base: 16px;    /* Base (1) */
  --font-md: 18px;      /* Base × 1.125 */
  --font-lg: 22px;      /* Base × φ⁰·⁵ */
  --font-xl: 26px;      /* Base × φ */
  --font-2xl: 32px;     /* Base × φ¹·² */
  --font-3xl: 42px;     /* Base × φ¹·⁵ */
  --font-4xl: 52px;     /* Base × φ² */
  --font-5xl: 68px;     /* Base × φ²·⁵ */
}
```

#### Spacing Scale (Golden Ratio: 1.618)
```css
:root {
  /* Base: 8px, Scale: ×1.618 */
  --space-0: 0px;
  --space-1: 8px;       /* Base (1×) */
  --space-2: 13px;      /* Base × φ⁰·⁵ */
  --space-3: 16px;      /* Base × 2 */
  --space-4: 21px;      /* Base × φ¹·² */
  --space-5: 26px;      /* Base × φ¹·⁵ */
  --space-6: 32px;      /* Base × 4 (2×) */
  --space-7: 42px;      /* Base × φ² */
  --space-8: 52px;      /* Base × φ²·² */
  --space-9: 68px;      /* Base × φ²·⁵ (3×) */
  --space-10: 84px;     /* Base × φ²·⁷ */
  --space-11: 110px;    /* Base × φ³ (4×) */
  --space-12: 136px;    /* Base × φ³·² */
  --space-13: 178px;    /* Base × φ³·⁵ (5×) */
}
```

#### Border Radius Scale
```css
:root {
  --radius-sm: 8px;     /* Subtle rounding */
  --radius-base: 10px;  /* Standard inputs */
  --radius-md: 12px;    /* Cards */
  --radius-lg: 16px;    /* Buttons */
  --radius-xl: 20px;    /* Large buttons */
  --radius-2xl: 24px;   /* Hero sections */
  --radius-full: 9999px; /* Circular */
}
```

#### Component Sizing
```css
:root {
  /* Heights based on golden ratio */
  --height-sm: 32px;    /* Small buttons */
  --height-base: 44px;  /* Touch targets */
  --height-md: 52px;    /* Medium buttons */
  --height-lg: 56px;    /* Large buttons */
  --height-xl: 68px;    /* Extra large */
  
  /* Card dimensions */
  --card-padding: 16px;
  --card-radius: 12px;
  --card-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
```

### Reusable Class Naming Convention

#### Utility Classes Pattern

```css
/* Spacing utilities (margin/padding) */
.m-{size}   { margin: var(--space-{size}); }
.mt-{size}  { margin-top: var(--space-{size}); }
.mb-{size}  { margin-bottom: var(--space-{size}); }
.ml-{size}  { margin-left: var(--space-{size}); }
.mr-{size}  { margin-right: var(--space-{size}); }
.mx-{size}  { margin-left: var(--space-{size}); margin-right: var(--space-{size}); }
.my-{size}  { margin-top: var(--space-{size}); margin-bottom: var(--space-{size}); }

.p-{size}   { padding: var(--space-{size}); }
.pt-{size}  { padding-top: var(--space-{size}); }
.pb-{size}  { padding-bottom: var(--space-{size}); }
.pl-{size}  { padding-left: var(--space-{size}); }
.pr-{size}  { padding-right: var(--space-{size}); }
.px-{size}  { padding-left: var(--space-{size}); padding-right: var(--space-{size}); }
.py-{size}  { padding-top: var(--space-{size}); padding-bottom: var(--space-{size}); }

/* Typography utilities */
.text-xs    { font-size: var(--font-xs); }
.text-sm    { font-size: var(--font-sm); }
.text-base  { font-size: var(--font-base); }
.text-lg    { font-size: var(--font-lg); }
.text-xl    { font-size: var(--font-xl); }
.text-2xl   { font-size: var(--font-2xl); }
.text-3xl   { font-size: var(--font-3xl); }
.text-4xl   { font-size: var(--font-4xl); }
.text-5xl   { font-size: var(--font-5xl); }

.font-light     { font-weight: 300; }
.font-normal    { font-weight: 400; }
.font-medium    { font-weight: 500; }
.font-semibold  { font-weight: 600; }
.font-bold      { font-weight: 700; }

.text-center { text-align: center; }
.text-left   { text-align: left; }
.text-right  { text-align: right; }

/* Color utilities */
.color-primary   { color: var(--app-primary); }
.color-secondary { color: var(--app-secondary); }
.color-success   { color: var(--app-success); }
.color-warning   { color: var(--app-warning); }
.color-error     { color: var(--app-error); }
.color-white     { color: #ffffff; }

.bg-primary   { background-color: var(--app-primary); }
.bg-secondary { background-color: var(--app-secondary); }
.bg-success   { background-color: var(--app-success); }
.bg-white     { background-color: #ffffff; }
.bg-dark      { background-color: var(--app-bg-dark); }

/* Border radius utilities */
.rounded-sm   { border-radius: var(--radius-sm); }
.rounded      { border-radius: var(--radius-base); }
.rounded-md   { border-radius: var(--radius-md); }
.rounded-lg   { border-radius: var(--radius-lg); }
.rounded-xl   { border-radius: var(--radius-xl); }
.rounded-2xl  { border-radius: var(--radius-2xl); }
.rounded-full { border-radius: var(--radius-full); }

/* Flexbox utilities */
.flex           { display: flex; }
.flex-col       { flex-direction: column; }
.flex-row       { flex-direction: row; }
.items-center   { align-items: center; }
.items-start    { align-items: flex-start; }
.items-end      { align-items: flex-end; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.justify-around { justify-content: space-around; }
.flex-1         { flex: 1; }
.flex-wrap      { flex-wrap: wrap; }

.gap-1 { gap: var(--space-1); }
.gap-2 { gap: var(--space-2); }
.gap-3 { gap: var(--space-3); }
.gap-4 { gap: var(--space-4); }
.gap-5 { gap: var(--space-5); }

/* Width utilities */
.w-full { width: 100%; }

/* Display utilities */
.inline-flex { display: inline-flex; }
.block { display: block; }
.hidden { display: none; }
```

#### Component Classes Pattern (BEM Style)

```css
/* BEM-style component classes */
.card { /* Base component */ }
.card__header { /* Component element */ }
.card__body { /* Component element */ }
.card__footer { /* Component element */ }
.card--elevated { /* Component modifier */ }
.card--outline { /* Component modifier */ }

/* Button variants */
.btn-primary { }
.btn-secondary { }
.btn-outline { }
.btn-ghost { }
.btn-sm { }
.btn-md { }
.btn-lg { }

/* Badge variants */
.badge-success { }
.badge-error { }
.badge-warning { }
.badge-info { }
```

### Usage Examples

```html
<!-- Utility classes in templates -->
<div class="flex gap-2 flex-wrap">
  <a href="#" class="chip">All</a>
</div>

<button class="button button-outline button-large w-full">
  <i class="icon material-icons mr-2">download</i>
  Download
</button>

<div class="flex items-center gap-2 mt-2">
  <span class="badge badge-success">ACTIVE</span>
</div>

<div class="card p-4 rounded-lg">
  <h2 class="text-xl font-semibold mb-3">Title</h2>
  <p class="text-base color-secondary">Description</p>
</div>
```

### Class Reusability & Customization

**Principle**: Reuse existing classes across pages for consistency, but extend with custom classes when specific pages require unique designs.

#### When to Reuse vs Customize

**Reuse existing classes when:**
- The design is similar across pages
- Only minor variations (colors, spacing) are needed
- Maintaining consistency is priority

**Add custom classes when:**
- Page requires unique visual identity
- Complex custom layouts are needed
- Specific functionality requires different styling
- Combining utility classes becomes too verbose

#### Best Practices

1. **Extend, don't replace** - Keep base class and add custom class
2. **Use descriptive names** - `profile-card`, `hero-banner`, `chat-bubble`
3. **Maintain CSS variable usage** - Even in custom styles, reference root variables
4. **Document purpose** - Add comments explaining why custom class exists
5. **Consider modifiers first** - Try using `card--profile` before creating entirely new class

```html
<!-- ✅ GOOD: Extends base with custom -->
<div class="card card--profile rounded-lg p-4">...</div>

<!-- ✅ ALSO GOOD: New class for unique design -->
<div class="hero-banner p-6">...</div>

<!-- ❌ BAD: No base class, inline styles -->
<div style="padding: 16px; background: #007aff;">...</div>
```

---

## Centralized Styling Architecture

**CRITICAL**: Define shared component styles in centralized `.less` or `.css` files, NOT in individual `.f7` files. This prevents code duplication and ensures consistency.

### Where to Define Styles

**✅ In .less/.css files (src/css/):**
- Component styles used across multiple pages (cards, buttons, forms)
- Utility classes (spacing, typography, colors)
- Layout patterns (grids, flexbox)
- Shared animations and transitions
- Global component variants

**❌ NOT in .f7 `<style>` blocks:**
- Repeated component definitions
- Utility class redefinitions
- Common patterns used elsewhere
- Styles that could be abstracted

### .f7 `<style>` Block Usage Rules

Use `<style scoped>` in .f7 files **ONLY** for:
1. **Page-specific overrides** that don't apply elsewhere
2. **Unique page layouts** that aren't reusable
3. **One-off styling** for specific page functionality
4. **Context-specific variations** of base components

```html
<!-- ✅ CORRECT: Using centralized classes -->
<template>
  <div class="page">
    <div class="card card--elevated p-4 rounded-lg">
      <h2 class="text-xl font-semibold mb-3">Profile</h2>
      <p class="text-base text-muted">Description</p>
    </div>
  </div>
</template>

<!-- No <style> block needed - all classes from centralized .less -->

<!-- ✅ ALSO CORRECT: Page-specific override only -->
<template>
  <div class="page custom-page">
    <div class="card custom-hero-card p-6">
      <h2 class="text-2xl font-bold">Custom Hero</h2>
    </div>
  </div>
</template>

<style scoped>
/* Only page-specific styling that can't be reused */
.custom-hero-card {
  background: linear-gradient(135deg, var(--app-primary), var(--app-secondary));
  animation: heroEntrance 0.6s ease-out;
}

@keyframes heroEntrance {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>

<!-- ❌ INCORRECT: Redefining common styles in .f7 -->
<template>
  <div class="card">Content</div>
</template>

<style scoped>
/* ❌ BAD: This should be in src/css/components/cards.less */
.card {
  padding: 16px;
  border-radius: 12px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
```

### How to Add New Shared Components

1. **Identify if style is reusable** - Will it be used on multiple pages?
2. **Create/update .less file** - Add to appropriate file in `src/css/components/`
3. **Follow BEM naming** - Use modifiers for variants (`.card--elevated`)
4. **Use CSS variables** - Reference root variables for all values
5. **Import in app.less** - Ensure it's loaded globally

**Example: Adding new card variant in src/css/components/cards.less**

```less
.card {
  padding: var(--space-4);
  border-radius: var(--radius-md);
  background: var(--app-bg);
  box-shadow: var(--card-shadow);
  
  &--elevated {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
  
  &--custom {
    background: linear-gradient(135deg, var(--app-primary), var(--app-secondary));
    color: white;
  }
  
  &__header {
    margin-bottom: var(--space-3);
    font-size: var(--font-lg);
    font-weight: 600;
  }
  
  &__body {
    font-size: var(--font-base);
    line-height: 1.6;
  }
}
```

### Implementation Rules

1. **Never use inline styles** - All styling must be in `<style>` blocks or external CSS
2. **Always use CSS variables** - Reference variables from app.less root
3. **Use reusable classes** - Create utility classes for common patterns
4. **Follow golden ratio** - All sizing should follow the defined scales
5. **Maintain consistency** - Use the same class names across all components
6. **DRY principle** - Don't repeat styles, create reusable classes instead
7. **Semantic naming** - Class names should describe purpose, not appearance
8. **Mobile-first** - Base styles for mobile, scale up with media queries
9. **Scoped styles** - Use `scoped` attribute in .f7 component styles when needed
10. **Performance** - Minimize CSS specificity, avoid deep nesting (max 3 levels)

### Optimization Best Practices

1. **Check before creating** - Search if class already exists in .less files
2. **Abstract common patterns** - If used 2+ times, move to .less file
3. **Use utility classes** - Combine utilities instead of custom classes when possible
4. **Avoid duplication** - Never copy/paste styles between .f7 files
5. **Follow Framework7 conventions** - Use Framework7's built-in classes first
6. **Minimize .f7 styles** - Keep `<style>` blocks small and page-specific only
7. **Leverage CSS cascade** - Let centralized styles do the work
8. **Document in comments** - Add purpose comments in .less files

---

## Reusable .f7 Components

**CRITICAL**: Create reusable .f7 components for UI elements used across multiple pages. This eliminates code duplication and enables "change once, apply everywhere" functionality.

### Why Use Reusable Components?

**Benefits:**
1. **DRY Principle** - Write once, use everywhere
2. **Single Source of Truth** - Change styling in one place, affects all pages
3. **Consistency** - All pages use identical component structure and styling
4. **Maintainability** - Update once instead of editing multiple files
5. **Productivity** - Faster development with pre-built components
6. **Type Safety** - Props provide clear interface for component usage

### Component Architecture

**Where to Create Components:**
- `/src/components/` - All reusable .f7 component files
- Examples: `BottomToolbar.f7`, `ProfileCard.f7`, `ActionButton.f7`

**Component Structure:**
```html
<template>
  <!-- Component HTML with props interpolation -->
  <div class="component ${someProp ? 'active' : ''}">
    <span>${propValue}</span>
  </div>
</template>

<script>
export default (props, { $f7 }) => {
  const { propValue = 'default', someProp = false } = props;
  
  return $render;
}
</script>

<style>
/* Component-specific styles (included with component) */
.component {
  /* Styles using CSS variables */
  background: var(--app-primary);
}
</style>
```

### How to Create a Reusable Component

#### Step 1: Create Component File

Create a new `.f7` file in `/src/components/`:

```html
<!-- /src/components/MyComponent.f7 -->
<template>
  <div class="my-component ${variant}">
    <h3>${title}</h3>
    <p>${description}</p>
  </div>
</template>

<script>
export default (props, { $f7 }) => {
  const { 
    title = 'Default Title',
    description = 'Default description',
    variant = 'primary'
  } = props;
  
  return $render;
}
</script>

<style>
.my-component {
  padding: var(--space-4);
  border-radius: var(--radius-md);
  background: var(--app-bg);
}

.my-component.primary {
  background: var(--app-primary);
  color: white;
}

.my-component.secondary {
  background: var(--app-secondary);
  color: white;
}
</style>
```

#### Step 2: Import Component in Page

```javascript
// Import the component
import MyComponent from '../components/MyComponent.f7';
```

#### Step 3: Use Component in Template

**CRITICAL SYNTAX:** Use `<${ComponentName} />` syntax to render imported .f7 components:

```html
<template>
  <div class="page">
    <div class="page-content">
      <!-- Use component with <${} /> syntax -->
      <${MyComponent} 
        title="Custom Title"
        description="Custom description"
        variant="primary"
      />
    </div>
  </div>
</template>

<script>
import MyComponent from '../components/MyComponent.f7';

export default (props, { $f7 }) => {
  return $render;
}
</script>
```

### Component Best Practices

#### 1. Props Definition

Always destructure props with default values:

```javascript
export default (props, { $f7 }) => {
  const { 
    activeTab = 'home',
    title = 'Default',
    isVisible = true,
    onClick = () => {},
    value = 0,
    label = '',
    icon = 'info',
    message = ''
  } = props;
  
  return $render;
}
```

#### 2. Conditional Rendering

Use ternary operators for conditional classes/content:

```html
<template>
  <div class="component ${isActive ? 'active' : ''} ${variant}">
    ${showIcon ? $h`<i class="icon material-icons">${icon}</i>` : ''}
    <span>${title}</span>
  </div>
</template>
```

#### 3. Style Organization

**In Component `<style>` Block:**
```css
/* Base component styles */
.component { }

/* State variations */
.component.active { }
.component.disabled { }

/* Variant styles */
.component.primary { }
.component.secondary { }
```

#### 4. Event Handling

Pass callback functions as props:

```javascript
// In parent page
const handleClick = () => {
  console.log('Clicked!');
};

// Pass to component
<${MyComponent} on-click=${handleClick} />
```

#### 5. Naming Conventions

- **Component Files**: PascalCase - `BottomToolbar.f7`, `ProfileCard.f7`
- **Import Variable**: PascalCase - `import BottomToolbarComponent`
- **Props**: camelCase - `activeTab`, `isVisible`, `onClick`
- **CSS Classes**: kebab-case - `.bottom-toolbar`, `.tab-link-active`

### Common Reusable Components

**Recommended components to create:**

1. **BottomToolbar.f7** - Bottom navigation
2. **TopNavbar.f7** - Top navigation bar with back button
3. **ActionButton.f7** - Standardized action buttons
4. **ProfileCard.f7** - User profile card display
5. **ListItem.f7** - Consistent list item layout
6. **EmptyState.f7** - Empty state placeholder
7. **LoadingSpinner.f7** - Loading indicator
8. **ErrorMessage.f7** - Error display component
9. **ConfirmDialog.f7** - Confirmation modal
10. **SearchBar.f7** - Search input component
11. **StatCard.f7** - Statistics card
12. **Badge.f7** - Status badge

### Component Template

Use this template when creating new components:

```html
<!-- /src/components/ComponentName.f7 -->
<template>
  <div class="component-name ${className}">
    <!-- Component HTML -->
  </div>
</template>

<script>
/**
 * ComponentName - Description of what this component does
 * 
 * Props:
 * - prop1 (string): Description
 * - prop2 (boolean): Description
 * - prop3 (function): Description
 */
export default (props, { $f7, $on, $onMounted, $onBeforeUnmount }) => {
  const { 
    prop1 = 'default',
    prop2 = false,
    prop3 = () => {}
  } = props;
  
  // Component logic here
  
  $onMounted(() => {
    // Initialization code
  });
  
  $onBeforeUnmount(() => {
    // Cleanup code
  });
  
  return $render;
}
</script>

<style>
/* Component styles */
.component-name {
  /* Use CSS variables */
  color: var(--app-primary);
  padding: var(--space-4);
  border-radius: var(--radius-md);
}

/* Component states */
.component-name.active { }
.component-name.disabled { }

/* Component variants */
.component-name.primary { }
.component-name.secondary { }
</style>
```

### Update Once, Apply Everywhere

**Example Scenario:**

You want to change a component's color scheme.

**Without Components (❌ Old Way):**
```
1. Edit page1.f7 - Update 100 lines of code
2. Edit page2.f7 - Update 100 lines of code
3. Edit page3.f7 - Update 100 lines of code
4. Edit page4.f7 - Update 100 lines of code
Total: 400 lines changed across 4 files
```

**With Components (✅ New Way):**
```
1. Edit MyComponent.f7 - Update 1 line:
   background: var(--app-primary);
Total: 1 line changed, affects all 4 pages automatically
```

**Result:** 99.75% less work! 🎉

### Troubleshooting

**Component not rendering?**
- ✅ Check import path is correct
- ✅ Verify using `<${ComponentName} />` syntax (not `<component-name>`)
- ✅ Ensure component file has proper export default structure
- ✅ Check for syntax errors in component template

**Props not working?**
- ✅ Verify prop names match exactly (case-sensitive)
- ✅ Check props are destructured in script section
- ✅ Ensure template uses `${}` syntax for prop values
- ✅ Test with default values first

**Styles not applying?**
- ✅ Check CSS class names are correct
- ✅ Verify CSS variables are defined in root
- ✅ Ensure style specificity isn't being overridden
- ✅ Check for scoped style conflicts

---

## File Organization

Standard file structure for Framework7 v9 applications:

```
my-app/
├── framework7.json         # Framework7 CLI configuration
├── package.json            # NPM dependencies
├── vite.config.js          # Vite configuration (if using Vite)
├── src/
│   ├── index.html          # Main HTML entry point
│   ├── app.f7              # Main app component (optional)
│   ├── js/
│   │   ├── app.js          # App initialization & configuration
│   │   ├── routes.js       # App routes configuration
│   │   ├── store.js        # Framework7 Store for state management
│   │   └── utils/          # Utility functions
│   │       ├── api.js      # API calls
│   │       ├── helpers.js  # Helper functions
│   │       └── constants.js # App constants
│   ├── pages/              # Framework7 Router Components (.f7 files)
│   │   ├── home.f7         # Home page
│   │   ├── about.f7        # About page
│   │   ├── 404.f7          # Not found page
│   │   ├── profile/        # Profile section
│   │   │   ├── profile.f7
│   │   │   ├── edit.f7
│   │   │   └── settings.f7
│   │   └── products/       # Products section
│   │       ├── list.f7
│   │       ├── details.f7
│   │       └── add.f7
│   ├── css/
│   │   ├── app.less        # Root variables & global styles
│   │   ├── framework7-custom.less # Framework7 overrides
│   │   ├── utilities/
│   │   │   ├── spacing.less    # Margin & padding utilities
│   │   │   ├── typography.less # Font utilities
│   │   │   ├── colors.less     # Color utilities
│   │   │   └── layout.less     # Flexbox & grid utilities
│   │   └── components/
│   │       ├── buttons.less    # Button styles
│   │       ├── cards.less      # Card styles
│   │       ├── forms.less      # Form styles
│   │       └── navigation.less # Navigation styles
│   ├── assets/
│   │   ├── images/         # Image assets
│   │   ├── icons/          # Custom icons
│   │   ├── fonts/          # Custom fonts
│   │   └── videos/         # Video assets
│   └── components/         # Reusable .f7 components
│       ├── BottomToolbar.f7    # Bottom navigation
│       ├── TopNavbar.f7        # Top navigation
│       ├── ActionButton.f7     # Action button
│       ├── ProfileCard.f7      # Profile card
│       ├── EmptyState.f7       # Empty state
│       └── LoadingSpinner.f7   # Loading indicator
└── www/                    # Production build output
```

### Key Directories

- **src/pages/** - All page components (.f7 files)
- **src/components/** - Reusable components (.f7 files)
- **src/css/** - Styles organized by type (utilities, components)
- **src/js/** - JavaScript logic (app config, routes, store)
- **src/assets/** - Static assets (images, icons, fonts)

---

## Best Practices

### Component Development

1. **Use .f7 Router Components** for all pages
2. **Create reusable components** in `/src/components/`
3. **Always use `$h` wrapper** for array mappings
4. **Destructure props** with default values
5. **Use CSS variables** for all colors and sizing
6. **Follow BEM naming** for custom CSS classes
7. **Leverage Framework7 built-in classes** first
8. **Document component props** in JSDoc style

### Styling

1. **Define styles in centralized .less files**, not in .f7 files
2. **Use utility classes** for common patterns
3. **Follow golden ratio** for sizing and spacing
4. **Never use inline styles** (use classes or CSS variables)
5. **Mobile-first responsive design**
6. **Support both light and dark themes**
7. **Use scoped styles** only for page-specific overrides
8. **Minimize CSS nesting** (max 3 levels deep)

### Performance

1. **Use lazy loading** for routes and components
2. **Optimize images** before importing
3. **Import assets via ES6 imports** for build optimization
4. **Use virtual lists** for large data sets
5. **Implement pull-to-refresh** for data updates
6. **Debounce search inputs** and API calls
7. **Use Framework7 Store** for efficient state management

### Code Quality

1. **Follow consistent naming conventions**
2. **Write self-documenting code** with clear variable names
3. **Add comments** for complex logic
4. **Keep functions small and focused** (single responsibility)
5. **Use modern ES6+ syntax** (arrow functions, destructuring, etc.)
6. **Handle errors gracefully** with try-catch blocks
7. **Validate user input** before processing

### Accessibility

1. **Use semantic HTML** elements
2. **Add ARIA labels** for screen readers
3. **Ensure keyboard navigation** works
4. **Maintain sufficient color contrast**
5. **Test with VoiceOver/TalkBack**
6. **Use proper heading hierarchy** (h1, h2, h3)
7. **Add alt text** to all images

### Testing

1. **Test on multiple devices** (iOS, Android)
2. **Test in different themes** (light, dark)
3. **Test offline functionality** if applicable
4. **Verify responsive breakpoints**
5. **Test with different screen sizes**
6. **Check performance** on low-end devices
7. **Validate forms** with edge cases

---

## Standard Coding Patterns

### Framework7 Router Component Pattern

```html
<template>
  <div class="page">
    <div class="navbar">
      <div class="navbar-bg"></div>
      <div class="navbar-inner">
        <div class="left">
          <a href="#" class="link back">
            <i class="icon material-icons">arrow_back</i>
          </a>
        </div>
        <div class="title">${title}</div>
        <div class="right">
          <a href="#" class="link icon-only" @click=${handleAction}>
            <i class="icon material-icons">more_vert</i>
          </a>
        </div>
      </div>
    </div>
    
    <div class="page-content">
      <!-- Use block/list components -->
      <div class="block-title">${sectionTitle}</div>
      <div class="list">
        <ul>
          ${items.map((item) => $h`
            <li>
              <div class="item-content">
                <div class="item-inner">
                  <div class="item-title">${item.title}</div>
                  <div class="item-after">${item.value}</div>
                </div>
              </div>
            </li>
          `)}
        </ul>
      </div>
      
      <!-- Combine with utility classes -->
      <div class="card p-4 rounded-lg">
        <h2 class="text-xl font-semibold mb-3">${cardTitle}</h2>
        <p class="text-base">${cardDescription}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default (props, { $f7, $on, $onMounted, $onBeforeUnmount }) => {
  // Destructure props with defaults
  const { 
    title = 'Page Title',
    sectionTitle = 'Section',
    cardTitle = 'Card Title',
    cardDescription = 'Description'
  } = props;
  
  // Component state
  let items = [];
  
  // Event handlers
  const handleAction = () => {
    $f7.dialog.alert('Action clicked!');
  };
  
  // Lifecycle hooks
  $onMounted(() => {
    console.log('Page mounted');
    // Initialize component
    loadData();
  });
  
  $onBeforeUnmount(() => {
    console.log('Page unmounting');
    // Cleanup
  });
  
  // Methods
  const loadData = async () => {
    try {
      // Fetch data
      items = await fetchItems();
      $update(); // Update component
    } catch (error) {
      console.error('Error loading data:', error);
      $f7.dialog.alert('Failed to load data');
    }
  };
  
  return $render;
}
</script>

<style scoped>
/* Page-specific styles only */
.custom-element {
  /* Use CSS variables */
  color: var(--app-primary);
}
</style>
```

### Framework7 Store Pattern

```javascript
// store.js
import { createStore } from 'framework7';

const store = createStore({
  state: {
    user: null,
    isAuthenticated: false,
    theme: 'light',
    notifications: [],
  },
  getters: {
    user({ state }) {
      return state.user;
    },
    isAuthenticated({ state }) {
      return state.isAuthenticated;
    },
    theme({ state }) {
      return state.theme;
    },
    notificationsCount({ state }) {
      return state.notifications.length;
    },
  },
  actions: {
    setUser({ state }, user) {
      state.user = user;
      state.isAuthenticated = !!user;
    },
    logout({ state }) {
      state.user = null;
      state.isAuthenticated = false;
    },
    setTheme({ state }, theme) {
      state.theme = theme;
      document.documentElement.classList.toggle('theme-dark', theme === 'dark');
    },
    addNotification({ state }, notification) {
      state.notifications = [...state.notifications, notification];
    },
    clearNotifications({ state }) {
      state.notifications = [];
    },
  },
});

export default store;
```

### Routes Configuration Pattern

```javascript
// routes.js
import HomePage from '../pages/home.f7';
import AboutPage from '../pages/about.f7';
import ProfilePage from '../pages/profile/profile.f7';
import NotFoundPage from '../pages/404.f7';

const routes = [
  {
    path: '/',
    component: HomePage,
  },
  {
    path: '/about/',
    component: AboutPage,
  },
  {
    path: '/profile/',
    component: ProfilePage,
  },
  {
    path: '/profile/edit/',
    async: function ({ resolve }) {
      // Lazy load component
      import('../pages/profile/edit.f7').then((component) => {
        resolve({ component: component.default });
      });
    },
  },
  {
    path: '(.*)',
    component: NotFoundPage,
  },
];

export default routes;
```

### App Initialization Pattern

```javascript
// app.js
import Framework7 from 'framework7/lite-bundle';
import Framework7Icons from 'framework7-icons';
import routes from './routes.js';
import store from './store.js';

// Import main app stylesheet
import '../css/app.less';

// Initialize Framework7 app
const app = new Framework7({
  name: 'My App',
  theme: 'auto',
  el: '#app',
  store: store,
  routes: routes,
  
  // App settings
  view: {
    stackPages: true,
    pushState: true,
  },
  
  // Toast settings
  toast: {
    closeTimeout: 3000,
  },
  
  // Dialog settings
  dialog: {
    buttonOk: 'OK',
    buttonCancel: 'Cancel',
  },
});

// Export app instance
export default app;
```

---

## Conclusion

These guidelines provide a solid foundation for developing high-quality Framework7 v9 applications. By following these patterns and best practices, you'll create maintainable, performant, and consistent applications.

### Key Takeaways

✅ **Always use `$h` wrapper** for array mappings  
✅ **Import assets via ES6 imports** for build optimization  
✅ **Use Material Icons** for consistency  
✅ **Define styles centrally** in .less files  
✅ **Create reusable .f7 components** for common UI elements  
✅ **Follow golden ratio** for sizing and spacing  
✅ **Use CSS variables** instead of hardcoded values  
✅ **Leverage Framework7 built-in classes** first  
✅ **Document component props** and usage  
✅ **Test thoroughly** across devices and themes  

---

**Happy coding with Framework7! 🚀**
