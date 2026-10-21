import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function PasswordInput({ autoComplete, required = true, minLength, value, onChange }) {
  const [visible, setVisible] = useState(false);

  return (
    <span className="password-input-row">
      <input type={visible ? 'text' : 'password'} autoComplete={autoComplete} required={required} minLength={minLength} value={value} onChange={onChange} />
      <button className="password-visibility" type="button" onClick={() => setVisible((current) => !current)} aria-pressed={visible} aria-label={visible ? 'Hide password' : 'Show password'} title={visible ? 'Hide password' : 'Show password'}>
        {visible ? <Eye size={20} /> : <EyeOff size={20} />}
      </button>
    </span>
  );
}
