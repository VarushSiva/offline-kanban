import { useAppSelector } from "../hooks";

export default function Announcer() {
  const a = useAppSelector((s) => s.ui.announcement);

  return (
    <div aria-live="polite" aria-atomic="true" className="sr-only">
      {a.nonce}:{a.text}
    </div>
  );
}
