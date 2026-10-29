import Link from "next/link";
import { MobileNavigation, MobileScreenHeader } from "@/components/MobileNavigation";
import { BellIcon } from "@/components/icons";

export default function NotificationsPage() {
  return (
    <main className="mobile-app-shell notifications-page">
      <MobileScreenHeader title="Notifications" backHref="/profile" />
      <section className="notification-empty">
        <span className="empty-icon-wrap" aria-hidden="true"><BellIcon /></span>
        <h1>No notifications yet</h1>
        <p>Live wait updates, office alerts, and requirements changes will appear here for your saved trips.</p>
        <Link href="/profile" className="mobile-secondary-link">Notification settings</Link>
      </section>
      <MobileNavigation active="trips" />
    </main>
  );
}
