"use client";

import { useEffect, useState } from "react";
import { readSavedLocationIds, toggleSavedLocation } from "@/lib/saved-locations";
import { HeartIcon } from "./icons";

export function SaveLocationButton({ id }: { id: string }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(readSavedLocationIds().includes(id));
  }, [id]);

  function handleToggle() {
    const nextSavedIds = toggleSavedLocation(id);
    setSaved(nextSavedIds.includes(id));
  }

  return (
    <button
      className={`save-location-button ${saved ? "is-saved" : ""}`}
      type="button"
      aria-pressed={saved}
      onClick={handleToggle}
    >
      <HeartIcon filled={saved} className="save-button-icon" />
      <span>{saved ? "Saved" : "Save location"}</span>
    </button>
  );
}
