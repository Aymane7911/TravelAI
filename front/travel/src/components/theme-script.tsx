// components/theme-script.tsx
// Add this script to prevent flash of unstyled content
export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            const theme = localStorage.getItem('theme') || 'light';
            document.documentElement.classList.add(theme);
          })();
        `,
      }}
    />
  )
}