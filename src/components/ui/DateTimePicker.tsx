"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  value: Date;
  min?: Date;
  onChange: (d: Date) => void;
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function DateTimePicker({ value, min, onChange }: Props) {
  const [viewYear, setViewYear] = useState(value.getFullYear());
  const [viewMonth, setViewMonth] = useState(value.getMonth());

  const today = min ?? new Date();
  today.setHours(0, 0, 0, 0);

  // Build calendar grid
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // pad to full rows
  while (cells.length % 7 !== 0) cells.push(null);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };

  const selectDay = (day: number) => {
    const next = new Date(value);
    next.setFullYear(viewYear, viewMonth, day);
    onChange(next);
  };

  const setHour = (h: number) => {
    const next = new Date(value);
    next.setHours(h);
    onChange(next);
  };
  const setMinute = (m: number) => {
    const next = new Date(value);
    next.setMinutes(m);
    onChange(next);
  };

  const isSelected = (day: number) =>
    day === value.getDate() &&
    viewMonth === value.getMonth() &&
    viewYear === value.getFullYear();

  const isDisabled = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    d.setHours(0, 0, 0, 0);
    return d < today;
  };

  const SZ = 28; // cell size px

  const cell: React.CSSProperties = {
    width: SZ,
    height: SZ,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
    fontSize: 12,
    cursor: "pointer",
    border: "none",
    background: "transparent",
    fontFamily: "var(--font-mono)",
    transition: "background 0.1s, color 0.1s",
    padding: 0,
  };

  const gridCols = `repeat(7, ${SZ}px)`;

  return (
    <div
      style={{
        background: "var(--paper)",
        border: "1px solid var(--rule)",
        borderRadius: 10,
        padding: 10,
        boxShadow: "var(--shadow-md)",
        userSelect: "none",
        width: "fit-content",
      }}
    >
      {/* Month navigation */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <button
          onClick={prevMonth}
          style={{ ...cell, width: 24, height: 24, color: "var(--ink-3)" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "var(--paper-2)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          <ChevronLeft style={{ width: 13, height: 13 }} />
        </button>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink)" }}>
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button
          onClick={nextMonth}
          style={{ ...cell, width: 24, height: 24, color: "var(--ink-3)" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "var(--paper-2)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          <ChevronRight style={{ width: 13, height: 13 }} />
        </button>
      </div>

      {/* Day headers */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: gridCols,
          gap: 2,
          marginBottom: 2,
        }}
      >
        {DAYS.map((d) => (
          <div
            key={d}
            style={{
              ...cell,
              cursor: "default",
              fontSize: 10,
              color: "var(--ink-4)",
              fontWeight: 500,
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: 2 }}>
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const selected = isSelected(day);
          const disabled = isDisabled(day);
          return (
            <button
              key={i}
              onClick={() => !disabled && selectDay(day)}
              disabled={disabled}
              style={{
                ...cell,
                color: disabled
                  ? "var(--ink-4)"
                  : selected
                    ? "var(--paper)"
                    : "var(--ink)",
                background: selected ? "var(--ink)" : "transparent",
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.35 : 1,
              }}
              onMouseEnter={(e) => {
                if (!selected && !disabled)
                  e.currentTarget.style.background = "var(--paper-2)";
              }}
              onMouseLeave={(e) => {
                if (!selected) e.currentTarget.style.background = "transparent";
              }}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "var(--rule)", margin: "8px 0" }} />

      {/* Time picker */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontSize: 10.5,
            fontFamily: "var(--font-mono)",
            color: "var(--ink-3)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Time
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
          <select
            value={value.getHours()}
            onChange={(e) => setHour(Number(e.target.value))}
            style={{
              padding: "4px 5px",
              borderRadius: 5,
              border: "1px solid var(--rule)",
              background: "var(--paper)",
              color: "var(--ink)",
              fontSize: 12,
              fontFamily: "var(--font-mono)",
              outline: "none",
              cursor: "pointer",
              appearance: "none" as const,
              WebkitAppearance: "none" as const,
              textAlign: "center",
              width: 40,
            }}
          >
            {Array.from({ length: 24 }, (_, h) => (
              <option key={h} value={h}>
                {pad(h)}
              </option>
            ))}
          </select>
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--ink-3)",
              fontFamily: "var(--font-mono)",
            }}
          >
            :
          </span>
          <select
            value={value.getMinutes()}
            onChange={(e) => setMinute(Number(e.target.value))}
            style={{
              padding: "4px 5px",
              borderRadius: 5,
              border: "1px solid var(--rule)",
              background: "var(--paper)",
              color: "var(--ink)",
              fontSize: 12,
              fontFamily: "var(--font-mono)",
              outline: "none",
              cursor: "pointer",
              appearance: "none" as const,
              WebkitAppearance: "none" as const,
              textAlign: "center",
              width: 40,
            }}
          >
            {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => (
              <option key={m} value={m}>
                {pad(m)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
