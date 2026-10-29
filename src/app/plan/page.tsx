"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MobileNavigation, MobileScreenHeader } from "@/components/MobileNavigation";
import {
  PassportIcon,
  DriverLicenceIcon,
  SparklesIcon,
  CheckIcon,
} from "@/components/icons";

const quickOptions = [
  { label: "Passport Renewal", icon: PassportIcon, text: "I need to renew my Nigerian passport in Lagos." },
  { label: "Driver’s Licence", icon: DriverLicenceIcon, text: "I need to renew my driver's licence in Lagos." },
  { label: "National ID (NIN)", icon: SparklesIcon, text: "I need help with my national ID in Lagos." },
  { label: "Combined Services", icon: SparklesIcon, text: "Help me prepare for both a passport and licence renewal." },
];

export default function PlanWizardPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState([""]);
  const [step, setStep] = useState<1 | 2>(1);
  const [deadline, setDeadline] = useState("");
  const [area, setArea] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get("task");
    if (initial) setTasks([initial]);
  }, []);

  async function continueToPlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const taskMessage = tasks.map((task) => task.trim()).filter(Boolean).join(" Also, ");
    if (step === 1) {
      if (taskMessage.length < 3) {
        setError("Please enter or select a service you need help with.");
        return;
      }
      setError("");
      setStep(2);
      return;
    }
    const details = [
      deadline ? `My deadline is ${deadline}.` : "",
      area ? `I prefer to visit in ${area}, Lagos.` : ""
    ].filter(Boolean).join(" ");
    const message = [taskMessage, details].filter(Boolean).join(" ");
    if (message.length < 3) {
      setError("Please describe the service you need.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "We could not build your plan. Please try again.");
      if (result.clarification_question) throw new Error(result.clarification_question);
      window.localStorage.setItem("queueless.pending-plan.v1", JSON.stringify(result));
      router.push("/plan/results");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We could not build your plan. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function addTask() {
    if (tasks.length < 3) setTasks((current) => [...current, ""]);
  }

  return (
    <main className="mobile-app-shell plan-wizard-page">
      <MobileScreenHeader title="Plan Visit" />

      <div className="wizard-progress" aria-label={`Step ${step} of 3: ${step === 1 ? "Task" : "Details"}`}>
        <div className={`wizard-progress-step ${step === 1 ? "is-current" : "is-complete"}`}>
          <span>{step === 1 ? "1" : <CheckIcon />}</span>
          <small>Task</small>
        </div>
        <i className={step === 2 ? "is-complete" : ""} />
        <div className={`wizard-progress-step ${step === 2 ? "is-current" : ""}`}>
          <span>2</span>
          <small>Details</small>
        </div>
        <i />
        <div className="wizard-progress-step">
          <span>3</span>
          <small>Plan</small>
        </div>
      </div>

      <section className="wizard-copy">
        <p className="mobile-eyebrow">{step === 1 ? "Step 1 of 2 · Requirement Check" : "Step 2 of 2 · Location & Date"}</p>
        <h1>{step === 1 ? "What service do you need?" : "Tailor your visit"}</h1>
        <p>
          {step === 1
            ? "Tell us what you need done, and QueueLess will build a sourced checklist of documents and fees."
            : "Add an optional deadline or preferred district to customize your preparation plan."}
        </p>
      </section>

      <form className="wizard-form" onSubmit={continueToPlan}>
        {step === 1 ? (
          <>
            {tasks.map((task, index) => (
              <label className="wizard-task-field" key={index}>
                <span className="sr-only">Task {index + 1}</span>
                <textarea
                  maxLength={1000}
                  rows={4}
                  value={task}
                  onChange={(event) =>
                    setTasks((current) => current.map((val, i) => (i === index ? event.target.value : val)))
                  }
                  placeholder="e.g. Renew my Nigerian passport and update my driver's licence in Ikeja"
                />
              </label>
            ))}

            {tasks.length < 3 && (
              <button className="add-task-button" type="button" onClick={addTask}>
                <span aria-hidden="true">＋</span>
                <span>Add another service task</span>
              </button>
            )}

            <fieldset className="quick-options">
              <legend>Popular service tasks</legend>
              <div className="quick-options-grid">
                {quickOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.label}
                      type="button"
                      className="quick-option-pill"
                      onClick={() =>
                        setTasks((current) => (current.length === 1 ? [option.text] : [...current.slice(0, -1), option.text]))
                      }
                    >
                      <span className="pill-icon" aria-hidden="true"><Icon /></span>
                      <span>{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </>
        ) : (
          <div className="visit-details-fields">
            <label>
              <span>Target visit deadline</span>
              <input
                type="date"
                value={deadline}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(event) => setDeadline(event.target.value)}
              />
            </label>
            <label>
              <span>Preferred Lagos district</span>
              <select value={area} onChange={(event) => setArea(event.target.value)}>
                <option value="">Choose nearest or choose later</option>
                {["Ikeja", "Ikoyi", "Festac", "Alimosho", "Ojo", "Akowonjo", "Ojodu", "Oshodi", "Agege", "Sura", "UNILAG", "Oto-Awori"].map(
                  (item) => <option key={item}>{item}</option>
                )}
              </select>
            </label>
            <div className="wizard-guidance-callout">
              <span className="callout-dot" />
              <p>Location suggestions are checked against verified NIS and FRSC offices. Confirm operational times before departure.</p>
            </div>
          </div>
        )}

        {error && <p className="mobile-error" role="alert">{error}</p>}

        {step === 2 && (
          <button className="wizard-back-button" type="button" onClick={() => setStep(1)}>
            ← Back to tasks
          </button>
        )}

        <button className="mobile-primary-button wizard-continue" type="submit" disabled={loading}>
          {loading ? "Checking official requirements…" : step === 1 ? "Next: Visit details" : "Generate my checklist"}
        </button>
      </form>

      <p className="mobile-data-note">Requirements sourced directly from Nigerian Immigration Service &amp; FRSC portals.</p>
      <MobileNavigation active="plan" />
    </main>
  );
}
