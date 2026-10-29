import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";

export default function WelcomePage() {
  return (
    <main className="welcome-screen">
      <div className="welcome-brand">
        <span className="brand-mark">Q</span>
        <strong>QueueLess</strong>
      </div>
      <section className="welcome-copy">
        <span className="welcome-badge">Lagos Service Pilot</span>
        <h1>Get it done in fewer trips.</h1>
        <p>Check official government requirements, find verified offices, and prepare your documents before you head out.</p>
      </section>
      <div className="welcome-art-container">
        <img className="welcome-illustration" src="/queue-welcome.svg" alt="A visitor preparing for a service centre visit in Lagos" />
      </div>
      <div className="welcome-actions">
        <Link className="mobile-primary-link" href="/onboarding">
          <span>Get started</span>
          <ArrowRightIcon />
        </Link>
        <Link className="mobile-secondary-link" href="/">Continue as guest</Link>
      </div>
      <p className="welcome-footnote">Sourced for Nigerian Immigration Service &amp; FRSC Lagos offices.</p>
    </main>
  );
}
