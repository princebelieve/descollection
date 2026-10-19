import { useEffect } from 'react';
import { Mail, X } from 'lucide-react';

export default function AccountModal({
  open,
  eyebrow,
  title,
  description,
  hint,
  icon: Icon = Mail,
  actionLabel = 'GOT IT',
  onClose,
}) {
  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="account-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="account-confirmation-modal" role="dialog" aria-modal="true" aria-labelledby="account-modal-title" aria-describedby="account-modal-description">
        <button className="account-modal-close" type="button" onClick={onClose} aria-label="Close dialog"><X size={21} /></button>
        <span className="account-modal-icon" aria-hidden="true"><Icon size={27} /></span>
        {eyebrow && <p className="kicker">{eyebrow}</p>}
        <h2 id="account-modal-title">{title}</h2>
        <div className="account-modal-description" id="account-modal-description">{description}</div>
        {hint && <p className="account-modal-hint">{hint}</p>}
        <button className="shop-now account-modal-done" type="button" onClick={onClose}>{actionLabel}</button>
      </section>
    </div>
  );
}
