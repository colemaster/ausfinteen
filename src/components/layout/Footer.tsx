export function Footer() {
  return (
    <footer className="bg-background border-t border-border mt-auto transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between gap-6 text-sm text-muted-foreground">
          <div className="max-w-xl leading-relaxed">
            <strong className="text-foreground font-semibold">Not financial advice.</strong>{' '}
            Australian Personal Finance Tools is a free educational tool. All calculations are illustrative only and
            should not be relied upon for financial decisions. Always consult a licensed
            Australian financial adviser (AFS licence holder) before acting.
          </div>
          <div className="flex flex-col items-start md:items-end gap-2 text-xs">
            <span>MIT Licence · Privacy-first · No tracking</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
