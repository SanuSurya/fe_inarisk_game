# INARISK Games Admin

Panel SvelteKit untuk mengatur bank soal dan level Quiz, pemain, log permainan,
skor, dan peringkat.

## Menjalankan lokal

```bash
cp .env.example .env
npm install
npm run dev
```

Frontend meminta `ADMIN_API_KEY` saat login. Nilainya harus sama dengan variable
`ADMIN_API_KEY` pada container `rust-inarisk-games`. Kredensial hanya disimpan di
`sessionStorage` browser.

## Build production

```bash
npm run check
npm run build
```

Gunakan `BASE_PATH=/inarisk-games-admin` apabila panel dipublikasikan pada
subpath tersebut. API production default mengarah ke
`https://inarisk2.bnpb.go.id/inarisk-games-api`.
