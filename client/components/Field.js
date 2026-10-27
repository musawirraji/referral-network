// Label, input and error in one place so every form wires up aria-invalid and
// aria-describedby the same way.
export default function Field({ id, label, error, hint, as = 'input', ...props }) {
  const Control = as;
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ');
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {hint && <p id={`${id}-hint`} className="hint">{hint}</p>}
      <Control
        id={id}
        name={id}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy || undefined}
        {...props}
      />
      {error && <p id={`${id}-error`} className="field-error">{error}</p>}
    </div>
  );
}
