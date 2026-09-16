# Ganesh Youth frontend

The backend is maintained separately in `GYProject/backend`.

## Account features

- Access management lets administrators create accounts with an optional mobile
  number and reset passwords for members and other administrators. A reset
  requires password confirmation and signs the target account out of existing
  sessions. Change your own password in My profile.
- Sign in with the account's email, saved mobile number, or existing username,
  together with its password. Add a mobile number during account creation or in
  My profile before using it to sign in.
- My profile accepts JPEG, PNG, and WebP uploads up to 5 MB. Select a local file,
  review the preview, and click Save profile. The returned photo also appears in
  the sidebar and header. The backend validates/resizes the image and stores it
  in PostgreSQL.

## Deploy

Deploy the updated backend first. Its `build.sh` must apply the committed
migrations, including `0006_profile_images_and_phone_login`, and install Pillow
from `requirements.lock.txt`. See the backend deployment notes for the database,
CORS, and first-administrator setup.

Then rebuild/redeploy this frontend with:

```env
VITE_API_URL=https://gyproject.onrender.com/api
```

The variable is read at build time. Changing `.env.example` alone does not change
a deployed build. Render's frontend service must run `npm ci && npm run build`
and start with `node server.cjs`.

## Verify locally

```powershell
npm ci
npm run lint
npm run build
```

Browser tests launch a local backend with a temporary SQLite database and a local
frontend. Install the backend's locked Python dependencies, then point the tests
at that Python environment and backend checkout:

```powershell
$env:GY_BACKEND_ROOT = 'C:/Users/katak/PycharmProjects/GYProject/backend'
$env:GY_TEST_PYTHON = 'C:/path/to/venv/Scripts/python.exe'
npm test
```

The test runner uses the backend repository's `scripts/test_server.py` fixtures.
It overrides the frontend API URL for the tests and does not use Render's database.

## Interface and appearance

The workspace uses Tailwind CSS 4 through its Vite plugin, locally served Inter,
Lucide icons, and Recharts. Theme tokens live in `src/styles/tokens.css`; shared
controls and page styles remain in the existing `src/styles` directory.

- Choose Light, Dark, or System in the header or sign-in page. The same choices
  are available in My profile & settings. Appearance persists in `gy_theme`;
  System follows live OS changes. An early script prevents a wrong-theme flash.
- The sidebar collapses on desktop and becomes a keyboard-accessible drawer on
  mobile. Record tables become cards on small screens. Festival budgets have
  card and table views using the existing budget and target-date fields.
- Collections, expenses, and budgets show year-wide summaries from the existing
  dashboard API. Search/status/category filters affect the records list; the
  summary remains for the selected festival year. Unsupported pledge balances,
  payment-completion metrics, and event APIs are not added.
- Existing routes, authentication/session storage, permissions, independent
  financial review, exports, profile uploads, and password management are kept.
  Account settings are in `/profile`; financial reporting stays in `/home` and
  the existing financial screens. Motion respects reduced-motion preferences.

### Original brand images

The image previews supplied in chat were not available as local image files.
The interface currently uses the community name as text. To finish the official
branding, place the two original files in `src/assets/brand/`:

- `ganesh-youth-2026.png`: official square logo, also accepting `.jpg`, `.jpeg`,
  or `.webp`. `Logo` displays this unmodified with `object-contain` in the sidebar,
  mobile header, sign-in visual, and dashboard hero.
- `ganesh-festival.png`: supporting portrait image, with the same supported
  extensions. This is used subtly in the sign-in visual only.

Rebuild after adding the images. Do not substitute or recreate the official logo.

### Frontend checks without a backend checkout

```powershell
npm run dev
npm run lint
npm run build
npm run test:frontend
```

The isolated Playwright suite uses Microsoft Edge and API fixtures **only inside
tests**. It covers every route at desktop/mobile widths in all three themes,
system theme changes and persistence, keyboard controls, responsive layouts,
member submission, review/export request contracts, failed submissions, retry,
empty states, and role restrictions. Production components always use the real
API. Screenshots are written under `test-results/`.

`npm test` continues to run the original backend integration suite and requires
the separate backend checkout and Python environment described above. UI fixture
tests do not establish that a deployed backend is reachable or behaving correctly.
