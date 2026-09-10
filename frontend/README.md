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
