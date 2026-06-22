import { defineConfig } from "tinacms";

export default defineConfig({
  branch: process.env.NEXT_PUBLIC_TINA_BRANCH || "main",
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID || "",
  token:    process.env.TINA_TOKEN || "",

  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },

  media: {
    tina: {
      mediaRoot: "",
      publicFolder: "public",
    },
  },

  schema: {
    collections: [

      /* ── 1. Site Config ──────────────────────────────────── */
      {
        name:   "siteConfig",
        label:  "Site Config",
        path:   "content",
        match:  { include: "siteConfig" },
        format: "json",
        ui:     { allowedActions: { create: false, delete: false } },
        fields: [
          { name: "siteName",    type: "string",  label: "Site Name" },
          { name: "tagline",     type: "string",  label: "Tagline" },
          { name: "logoUrl",     type: "image",   label: "Logo" },
          { name: "accentColor", type: "string",  label: "Accent Color (hex)" },
          {
            name: "social", type: "object", label: "Social Links",
            fields: [
              { name: "twitter",  type: "string", label: "Twitter/X URL" },
              { name: "linkedin", type: "string", label: "LinkedIn URL" },
              { name: "github",   type: "string", label: "GitHub URL" },
            ],
          },
        ],
      },

      /* ── 2. Homepage ─────────────────────────────────────── */
      {
        name:   "homepage",
        label:  "Homepage",
        path:   "content",
        match:  { include: "homepage" },
        format: "json",
        ui:     { allowedActions: { create: false, delete: false } },
        fields: [
          {
            name: "hero", type: "object", label: "Hero Section",
            fields: [
              { name: "eyebrowText",   type: "string", label: "Eyebrow Text" },
              { name: "headline",      type: "string", label: "Headline" },
              { name: "subheadline",   type: "string", label: "Subheadline" },
              {
                name: "primaryCta", type: "object", label: "Primary CTA",
                fields: [
                  { name: "label", type: "string" },
                  { name: "href",  type: "string" },
                ],
              },
              {
                name: "secondaryCta", type: "object", label: "Secondary CTA",
                fields: [
                  { name: "label", type: "string" },
                  { name: "href",  type: "string" },
                ],
              },
            ],
          },
          {
            name: "stats", type: "object", label: "Stats Row",
            list: true,
            fields: [
              { name: "value", type: "string", label: "Value (e.g. 00:47)" },
              { name: "label", type: "string", label: "Label" },
            ],
          },
          {
            name: "scrollStory", type: "object", label: "Scroll Story Scenes",
            list: true,
            fields: [
              { name: "num",     type: "string", label: "Step Number (e.g. 01)" },
              { name: "heading", type: "string", label: "Heading" },
              { name: "body",    type: "string", label: "Body Text", ui: { component: "textarea" } },
              { name: "tag",     type: "string", label: "Tag Pill Text" },
              { name: "url",     type: "string", label: "Browser Bar URL" },
            ],
          },
          {
            name: "features", type: "object", label: "Features",
            list: true,
            fields: [
              { name: "icon",  type: "string", label: "Emoji Icon" },
              { name: "title", type: "string", label: "Title" },
              { name: "body",  type: "string", label: "Body", ui: { component: "textarea" } },
            ],
          },
          {
            name: "outro", type: "object", label: "Demo Wall / Outro",
            fields: [
              { name: "headline",    type: "string", label: "Headline" },
              { name: "subheadline", type: "string", label: "Subheadline" },
              {
                name: "ctaPrimary", type: "object", label: "Primary CTA",
                fields: [
                  { name: "label", type: "string" },
                  { name: "href",  type: "string" },
                ],
              },
              {
                name: "ctaSecondary", type: "object", label: "Secondary CTA",
                fields: [
                  { name: "label", type: "string" },
                  { name: "href",  type: "string" },
                ],
              },
            ],
          },
        ],
      },

      /* ── 3. Demos ────────────────────────────────────────── */
      {
        name:   "demos",
        label:  "Demos",
        path:   "content/demos",
        format: "json",
        fields: [
          { name: "name",        type: "string",  label: "Name",     isTitle: true, required: true },
          { name: "slug",        type: "string",  label: "Slug (URL-safe)" },
          { name: "industry",    type: "string",  label: "Industry" },
          { name: "description", type: "string",  label: "Description", ui: { component: "textarea" } },
          {
            name: "kpis", type: "string", label: "KPIs",
            list: true,
            ui: { component: "tags" },
          },
          {
            name: "tags", type: "string", label: "Tags",
            list: true,
            ui: { component: "tags" },
          },
          { name: "featured", type: "boolean", label: "Featured?" },
          { name: "href",     type: "string",  label: "Internal Route (e.g. /demos/falcon-finance)" },
        ],
      },

      /* ── 4. Navigation ───────────────────────────────────── */
      {
        name:   "navigation",
        label:  "Navigation",
        path:   "content",
        match:  { include: "navigation" },
        format: "json",
        ui:     { allowedActions: { create: false, delete: false } },
        fields: [
          {
            name: "links", type: "object", label: "Nav Links",
            list: true,
            fields: [
              { name: "label", type: "string", label: "Label" },
              { name: "href",  type: "string", label: "Href" },
            ],
          },
          { name: "ctaLabel", type: "string", label: "CTA Button Label" },
          { name: "ctaHref",  type: "string", label: "CTA Button Href" },
        ],
      },

      /* ── 5. Footer ───────────────────────────────────────── */
      {
        name:   "footer",
        label:  "Footer",
        path:   "content",
        match:  { include: "footer" },
        format: "json",
        ui:     { allowedActions: { create: false, delete: false } },
        fields: [
          { name: "tagline",   type: "string", label: "Tagline" },
          { name: "copyright", type: "string", label: "Copyright Line" },
          {
            name: "linkGroups", type: "object", label: "Link Groups",
            list: true,
            fields: [
              { name: "title", type: "string", label: "Group Title" },
              {
                name: "links", type: "object", label: "Links",
                list: true,
                fields: [
                  { name: "label", type: "string" },
                  { name: "href",  type: "string" },
                ],
              },
            ],
          },
          {
            name: "socialLinks", type: "object", label: "Social Links",
            list: true,
            fields: [
              { name: "label", type: "string" },
              { name: "href",  type: "string" },
            ],
          },
        ],
      },

      /* ── 6. Pages (stubs) ────────────────────────────────── */
      {
        name:   "pages",
        label:  "Pages",
        path:   "content/pages",
        format: "json",
        fields: [
          { name: "title",   type: "string", label: "Page Title", isTitle: true, required: true },
          { name: "slug",    type: "string", label: "URL Slug" },
          { name: "content", type: "rich-text", label: "Page Content" },
        ],
      },
    ],
  },
});
