import React, { useEffect, useState } from 'react'

export function QualityGroup({ title, children }) {
  return <div className="quality-group"><h3>{title}</h3><div className="range-grid">{children}</div></div>
}

export function PanelTabs({ tabs, active, onChange }) {
  return (
    <div className="panel-tabs" role="tablist">
      {tabs.map(([id, label]) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={active === id}
          className={active === id ? 'active' : ''}
          onClick={() => onChange(id)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

export function FontPicker({ tr, options, value, loading, onChange, onLoad }) {
  return (
    <div className="font-picker">
      <span>
        {tr.font}
        <button type="button" className="font-load" disabled={loading} onClick={onLoad}>
          {loading ? tr.loadingFonts : tr.loadFonts}
        </button>
      </span>
      <select aria-label={tr.font} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value} style={{ fontFamily: option.value }}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  )
}

export function Range({ label, value, min, max, step = 1, onChange }) {
  const formatValue = (nextValue) => Number(nextValue).toFixed(step < 1 ? 2 : 0)
  const [draft, setDraft] = useState(formatValue(value))

  useEffect(() => setDraft(formatValue(value)), [value, step])

  const updateNumber = (rawValue) => {
    setDraft(rawValue)
    if (rawValue.trim() === '') return

    const numericValue = Number(rawValue)
    if (!Number.isFinite(numericValue)) return

    const clampedValue = Math.min(Number(max), Math.max(Number(min), numericValue))
    if (clampedValue !== numericValue) setDraft(formatValue(clampedValue))
    onChange(clampedValue)
  }

  const nudge = (direction) => {
    const nextValue = Math.min(Number(max), Math.max(Number(min), Number(value) + direction * Number(step)))
    updateNumber(formatValue(nextValue))
  }

  return (
    <div className="range">
      <div className="range-header">
        <span className="range-title">{label}</span>
        <span className="range-stepper">
          <button type="button" aria-label={`${label} −`} title={`−${step}`} disabled={Number(value) <= Number(min)} onClick={() => nudge(-1)}>−</button>
          <input className="range-number" type="number" aria-label={label} value={draft} min={min} max={max} step={step} onChange={(event) => updateNumber(event.target.value)} onBlur={() => setDraft(formatValue(value))}/>
          <button type="button" aria-label={`${label} ＋`} title={`＋${step}`} disabled={Number(value) >= Number(max)} onClick={() => nudge(1)}>＋</button>
        </span>
      </div>
      <input type="range" aria-label={label} value={value} min={min} max={max} step={step} onChange={(event) => onChange(Number(event.target.value))}/>
    </div>
  )
}
