'use client';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer footer-center p-4 bg-base-100 shadow-sm">
      <div className="flex items-center gap-1 text-base-content/70">
        <span>© {currentYear}</span>
        <span className="font-semibold text-primary">CajuSoft</span>
        <span>- Todos os direitos reservados</span>
      </div>
    </footer>
  );
} 