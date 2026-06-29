import { Link, ClickEvent, CustomDomain, ApiKey } from '../types';

export const initialLinks: Link[] = [];

export const initialClickEvents: ClickEvent[] = [];

export const initialDomains: CustomDomain[] = [];

export const initialApiKeys: ApiKey[] = [];

export const faqItems = [
  {
    question: "How does the custom alias/back-half feature work?",
    answer: "When creating a short link, you can specify a descriptive alias (e.g., 'react19' instead of 'df8g3'). This makes your link recognizable, brand-focused, and highly clickable on newsletters or social media."
  },
  {
    question: "Can I protect my shortened links with a password?",
    answer: "Yes! Shortify offers full password protection. When a user clicks a protected link, they will be presented with an elegant, responsive security gate to enter the password before being securely redirected."
  },
  {
    question: "Are the QR codes generated dynamic or static?",
    answer: "Every QR code is dynamic. If you change the destination URL, the QR code remains exactly the same, but automatically points users to your updated URL. You can also customize colors and download high-res files instantly."
  },
  {
    question: "How do your real-time analytics track geographic and device data?",
    answer: "Our analytics engine intercepts link clicks, parses the HTTP User-Agent securely to extract OS, browser, and device metrics, and uses country geolocation to provide beautiful maps and demographic breakdowns instantly."
  },
  {
    question: "What are custom domains, and how do I configure them?",
    answer: "Custom domains allow you to shorten links using your own brand (e.g., links.yourbrand.com). Simply point an A or CNAME record to our server in your DNS registrar, add it to your Settings panel, and you are ready to go!"
  }
];
