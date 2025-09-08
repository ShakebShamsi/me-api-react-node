
# Me-API (React + Node)

Full-stack sample for Track A with multi-profile support and a React UI.

## Run Backend
```bash
cd backend
cp .env.example .env   # optional: change API_KEY/PORT
npm install
npm run seed           # loads 20 dummy profiles
npm run dev            # http://localhost:4000
```

## Run Frontend
```bash
cd frontend
npm install
npm run dev            # http://localhost:5173
```
The frontend proxies `/api/*` to the backend.

### API Highlights
- `GET /profiles` with `?q=` and `?skill=`
- `GET /profiles/:id`
- `GET /skills/top`
- `GET /search?q=`
- `POST /profiles` & `PUT /profiles/:id` (with `x-api-key`)
