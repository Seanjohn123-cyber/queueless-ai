import Link from "next/link";
import { MobileNavigation, MobileScreenHeader } from "@/components/MobileNavigation";

export default function AboutPage() {
  return <main className="mobile-app-shell about-page"><MobileScreenHeader title="About QueueLess" backHref="/profile" /><div className="about-brand"><span className="brand-mark">Q</span><strong>QueueLess</strong><small>Lagos service guide pilot</small></div><section className="about-panel"><h1>Prepare before you go.</h1><p>QueueLess helps people review official service requirements, prepare a checklist, and organize errands before visiting in-person services.</p><p>This pilot covers passport renewal and driver’s licence renewal in Lagos. Location records are reported and remain marked unverified until confirmed.</p><p>Queue times are never invented. Estimates appear only when enough recent, reliable reports exist.</p></section><p className="about-credit">Location coordinates stay in your browser.</p><Link className="mobile-secondary-link" href="/support">Help &amp; support</Link><Link className="mobile-text-link" href="/welcome">Preview welcome screen</Link><MobileNavigation active="home" /></main>;
}
