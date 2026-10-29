import Link from "next/link";
import { MobileNavigation, MobileScreenHeader } from "@/components/MobileNavigation";

const faqs = [
  ["How do wait time estimates work?", "QueueLess shows a wait only when there are enough recent, reliable visit reports. For this Lagos pilot, wait times are currently unknown and are never guessed."],
  ["What documents do I need?", "Open a visit plan to see the official requirements we reviewed, with a source link and check date. Confirm the latest details with the agency before travelling."],
  ["Can I book an appointment?", "QueueLess does not book appointments. Use the official NIS or FRSC service portal to confirm appointments and processing locations."],
  ["How do I report a wait?", "After your visit, use the visit report form to share your arrival time, wait duration, and whether you completed the service. Do not include identity details."],
  ["Why is a location marked unverified?", "The listed locations came from reported sources and have not been confirmed through an official agency location list or direct confirmation."],
];

export default function SupportPage() {
  return (
    <main className="mobile-app-shell support-page"><MobileScreenHeader title="Help & support" backHref="/profile" /><p className="support-intro">Answers about plans, sources, locations, and queue reports.</p><section className="support-faqs" aria-label="Frequently asked questions">{faqs.map(([question, answer]) => <details key={question}><summary>{question}<span>›</span></summary><p>{answer}</p></details>)}</section><Link className="mobile-primary-link" href="/report">Report a visit</Link><MobileNavigation active="home" /></main>
  );
}
