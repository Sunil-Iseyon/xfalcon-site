/**
 * Content helpers — read from local JSON files at build/server time.
 * TinaCMS's editing UI overlays these values at /admin when credentials
 * are set (NEXT_PUBLIC_TINA_CLIENT_ID + TINA_TOKEN env vars).
 */

import siteConfigRaw  from "../../content/siteConfig.json";
import homepageRaw    from "../../content/homepage.json";
import navigationRaw  from "../../content/navigation.json";
import footerRaw      from "../../content/footer.json";

/* ─── Types ──────────────────────────────────────────────────────── */

export interface SiteConfig {
  siteName:    string;
  tagline:     string;
  logoUrl:     string;
  accentColor: string;
  social: {
    twitter:  string;
    linkedin: string;
    github:   string;
  };
}

export interface NavLink   { label: string; href: string }
export interface CtaButton { label: string; href: string }

export interface Navigation {
  links:    NavLink[];
  ctaLabel: string;
  ctaHref:  string;
}

export interface FooterLinkGroup {
  title: string;
  links: NavLink[];
}

export interface FooterContent {
  tagline:    string;
  copyright:  string;
  linkGroups: FooterLinkGroup[];
  socialLinks: NavLink[];
}

export interface HomepageStat   { value: string; label: string }
export interface HomepageScene  { num: string; heading: string; body: string; tag: string; url: string }
export interface HomepageFeature{ icon: string; title: string; body: string }

export interface HomepageContent {
  hero: {
    eyebrowText:  string;
    headline:     string;
    subheadline:  string;
    primaryCta:   CtaButton;
    secondaryCta: CtaButton;
  };
  stats:       HomepageStat[];
  scrollStory: HomepageScene[];
  features:    HomepageFeature[];
  outro: {
    headline:      string;
    subheadline:   string;
    ctaPrimary:    CtaButton;
    ctaSecondary:  CtaButton;
  };
}

/* ─── Getters ────────────────────────────────────────────────────── */

export function getSiteConfig():  SiteConfig      { return siteConfigRaw as SiteConfig; }
export function getHomepage():    HomepageContent { return homepageRaw   as HomepageContent; }
export function getNavigation():  Navigation      { return navigationRaw as Navigation; }
export function getFooterContent(): FooterContent { return footerRaw    as FooterContent; }
