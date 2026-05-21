# Homelab Deployment Guide

## Requirements

- Ubuntu Server (tested on 22.04 / 24.04)
- Docker + Docker Compose v2
- CD drive at `/dev/sr0` (verify with `ls -la /dev/sr*`)
- `wodim` installed on the **host**: `sudo apt install wodim`
- Optional: give your user access to the CD drive group: `sudo usermod -aG cdrom $USER`

## First-Time Setup

### 1. Clone the repo

```bash
git clone <repo-url> cdburner
cd cdburner
```

### 2. Create the `.env` file

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```env
CD_DEVICE=/dev/sr0
MAX_UPLOAD_MB=200
# Leave Spotify empty — not used
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
```

### 3. Create storage directories

```bash
mkdir -p storage/uploads storage/converted storage/temp
```

### 4. Start everything

```bash
docker compose up -d --build
```

### 5. Access the app

Open `http://<homelab-ip>:3000` in your browser.
Backend API is at `http://<homelab-ip>:8000`.

---

## docker-compose.yml Notes

The CD drive is passed through to the backend container via:
```yaml
devices:
  - /dev/sr0:/dev/sr0
```

`wodim` is installed inside the backend Docker image (not called via host).
This keeps the container self-contained while still accessing the physical drive.

## Updating

```bash
git pull
docker compose up -d --build
```

Data in `storage/` and `cdburner.db` persists across rebuilds.

## Checking Logs

```bash
docker compose logs -f backend
docker compose logs -f frontend
```

## Stopping

```bash
docker compose down
```

## Troubleshooting

**"Permission denied" on /dev/sr0**
Run: `sudo chmod 666 /dev/sr0` (temporary) or add the container user to the `cdrom` group.

**wodim not found**
It's installed inside the Docker image — you don't need it on the host. If the container can't find it, rebuild: `docker compose build --no-cache backend`.

**yt-dlp download fails**
Update yt-dlp inside the container: `docker compose exec backend pip install -U yt-dlp`.
YouTube occasionally breaks yt-dlp; keeping it updated is normal maintenance.
