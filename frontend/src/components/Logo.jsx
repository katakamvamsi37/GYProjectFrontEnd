// Display only original supplied artwork, with its aspect ratio intact.
const images = import.meta.glob('../assets/brand/*.{png,jpg,jpeg,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
});
const logo = Object.entries(images).find(([path]) => /ganesh-youth-2026\./.test(path))?.[1];
export const festivalImage = Object.entries(images).find(([path]) =>
  /ganesh-festival\./.test(path),
)?.[1];
export default function Logo({ variant = 'sidebar', label = true }) {
  return (
    <span className={`brand logo-${variant}`}>
      {logo && (
        <img
          className="brand-image object-contain"
          src={logo}
          width="1254"
          height="1254"
          alt="Official Pedda Nalla Kalva Ganesh Youth 2026 logo"
          fetchPriority={variant === 'login' ? 'high' : 'auto'}
        />
      )}
      {label && (
        <span className="brand-wordmark">
          <strong>
            Ganesh Youth<span className="brand-dot">.</span>
          </strong>
          <small>COMMUNITY WORKSPACE</small>
        </span>
      )}
    </span>
  );
}
