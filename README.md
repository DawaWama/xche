# Խաչատրյաններ — Family Tree Website

Static website for the Khachatryan family history and family tree.

## Pages

- `index.html` — Main menu
- `history.html` — Family history
- `tree.html` — Interactive family tree (starts at person id `0`)
- `people.html` — Directory of all family members

## Data

Edit the relevant file under `data/people/` to add or update family members. Each direct branch of Խաչատուր has its own JSON file. Each person has:

- `id`, `name`, `secondName`, `fathersName`
- `birthDate`, `dieDate`, `phone`, `description`
- `imageAddress` — path under `images/people/`
- `fatherId` — parent id (`null` for root)
- `sonsIdList` — array of child ids

The application loads all six branch files automatically:

- `data/people/branch-1.json` through `data/people/branch-6.json`

## Local preview

```bash
cd Khachatryanner
python3 -m http.server 8080
```

Open http://localhost:8080

## Deploy to Cloudflare Pages

1. Push this folder to GitHub
2. Cloudflare Dashboard → Workers & Pages → Create → Connect to Git
3. Build command: *(empty)*
4. Output directory: `/`

## Images

- Logo: `images/logos/logo.avif`
- Person photos: add files to `images/people/` matching paths in the relevant branch file
- Missing photos fall back to `images/people/default.avif`
