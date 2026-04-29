"use client";

import { useEffect, useState } from "react";

interface SectionIndicatorProps {
  sections: string[];
}

export function SectionIndicator({ sections }: SectionIndicatorProps) {
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(i);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="section-indicator" aria-label="Section navigation">
      {sections.map((section, index) => (
        <button
          key={section}
          onClick={() => scrollToSection(section)}
          className={`section-dot ${index === activeSection ? "active" : ""}`}
          aria-label={`Scroll to ${section} section`}
          aria-current={index === activeSection ? "true" : "false"}
        />
      ))}
    </nav>
  );
}