export function AnnouncementBar({ text }: { text: string | null }) {
  if (!text) return null;
  return (
    <div className="bg-ink px-4 py-2 text-center text-[0.8125rem] font-medium tracking-wide text-gold-light">
      {text}
    </div>
  );
}
