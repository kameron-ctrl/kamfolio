"use client";

/**
 * Contact bar: a frosted pill fixed top-right with Resume, GitHub, LinkedIn
 * and Email. Fades in once the intro loader leaves, tucks up out of the way
 * while scrolling down, and drops back in on any scroll up. Keyboard focus
 * always brings it back (CSS :focus-within). Email hides below md, where the
 * rocket's panel already covers it.
 */
import { useEffect, useState } from "react";
import { CONTACT_LINKS, type ContactLink } from "@/content/contact";
import { useLoadStore } from "@/lib/load-store";
import { useScrollStore } from "@/lib/scroll-store";
import { MONO } from "@/components/ui/classes";
import { nextBarState, type BarState } from "./bar-visibility";
import "./contact-bar.css";

const INITIAL_STATE: BarState = { hidden: false, anchorY: 0 };

/** Tracks scroll direction without re-rendering on every scroll frame. */
function useTucked(): { tucked: boolean; hasTucked: boolean } {
  const [tucked, setTucked] = useState<boolean>(false);
  const [hasTucked, setHasTucked] = useState<boolean>(false);

  useEffect(() => {
    let state = nextBarState(INITIAL_STATE, useScrollStore.getState().scrollY);
    setTucked(state.hidden);
    return useScrollStore.subscribe((s) => {
      const next = nextBarState(state, s.scrollY);
      if (next === state) return;
      state = next;
      setTucked(next.hidden); // React bails out when the value is unchanged
      if (next.hidden) setHasTucked(true);
    });
  }, []);

  return { tucked, hasTucked };
}

function ariaLabel(link: ContactLink): string | undefined {
  if (link.id === "resume") return "Resume PDF (opens in a new tab)";
  if (link.newTab) return `${link.label} profile (opens in a new tab)`;
  return `Email Kameron`;
}

export default function ContactBar(): JSX.Element {
  const introDone = useLoadStore((s) => s.introDone);
  const { tucked, hasTucked } = useTucked();

  // has-tucked: past the first entrance, so returns skip the entrance delay
  const classes = [
    "contact-bar",
    introDone && "is-visible",
    introDone && tucked && "is-tucked",
    introDone && hasTucked && "has-tucked",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <nav
      aria-label="Contact and profiles"
      aria-hidden={introDone ? undefined : true}
      data-testid="contact-bar"
      className={classes}
    >
      <ul className="contact-bar__list">
        {CONTACT_LINKS.map((link) => (
          <li key={link.id} className={`contact-bar__item contact-bar__item--${link.id}`}>
            <a
              href={link.href}
              target={link.newTab ? "_blank" : undefined}
              rel={link.newTab ? "noopener noreferrer" : undefined}
              aria-label={ariaLabel(link)}
              tabIndex={introDone ? undefined : -1}
              className={`${MONO} contact-bar__link`}
            >
              {link.label}
              {link.newTab && (
                <span aria-hidden="true" className="contact-bar__arrow">
                  ↗
                </span>
              )}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
