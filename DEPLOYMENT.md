# Hosting the Kidz Time School website on your own laptop

No hosting company, no cloud services. You need: the laptop, your home internet, and your GoDaddy domain.
This guide assumes the laptop runs **Ubuntu Server 24.04 LTS** (free). If the laptop must keep Windows, tell me and I will write a Windows version.

## 0. What this costs and what can go wrong
- **Money:** your existing domain renewal, electricity (an idle laptop is usually roughly 10 to 25 watts), and a **public IP address from your internet provider if you don't already have one** (see step 1). The HTTPS certificate is free and automatic.
- **Uptime = your power + your internet.** If either is off, the website is off. A small UPS is the best extra purchase.
- **Check your internet plan.** Some home plans forbid running servers. Ask your provider.
- Do **not** change any GoDaddy DNS record until step 7. Everything before that happens privately.

## 1. Can the internet reach your laptop? (do this first)
Most Indian providers put home connections behind "CGNAT", which makes direct hosting impossible.
1. Log in to your router and find the **WAN / Internet IP address**.
2. On any device on the same wifi, search "what is my IP" in a browser.
3. If the two numbers are **identical**, you have a public IP (good). If they differ, or the router shows a number starting 100.64 to 100.127, 10., 172.16 to 172.31 or 192.168, you are behind CGNAT.

If you are behind CGNAT, the cheapest fix that keeps you service-free is to ask your provider for a **static public IPv4 address**. Forum reports put this around ₹100 to ₹350 a month depending on the provider, so ask for the current price. (A free alternative, Cloudflare Tunnel, avoids this problem but is an outside service, which you ruled out.)

If you have a public IP that **changes** occasionally, either ask for a static one, or use `deploy/ddns.sh` (step 8).

## 2. Prepare the laptop
1. Install Ubuntu Server from ubuntu.com using a USB stick. Tick **Install OpenSSH server** during setup. This erases the laptop.
2. Keep it running with the lid closed: `sudo nano /etc/systemd/logind.conf`, set `HandleLidSwitch=ignore` and `HandleLidSwitchExternalPower=ignore`, then `sudo reboot`.
3. In the BIOS, enable "power on after AC power loss" if your laptop has it. Many do not, so after a long outage you may need to press the power button.
4. In your router, give the laptop a **fixed local address** (called a "DHCP reservation") so it never changes.
5. Update and add automatic security updates: `sudo apt update && sudo apt -y upgrade && sudo apt -y install unattended-upgrades unzip python3`.
6. Firewall (SSH only from inside your home, web from everywhere):
   ```
   sudo ufw default deny incoming
   sudo ufw allow from 192.168.0.0/16 to any port 22 proto tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw allow 443/udp
   sudo ufw enable
   ```
   Never publish extra ports in `docker-compose.yml`: Docker can bypass this firewall.
7. Install Docker: `curl -fsSL https://get.docker.com | sudo sh`, then `sudo usermod -aG docker $USER` and log in again.

## 3. Copy the project and configure it
1. From your main computer: `scp kidztime-site-final.zip YOURUSER@LAPTOP_LOCAL_IP:~` (or use a USB stick), then on the laptop `unzip kidztime-site-final.zip && cd kidztime-site`.
2. `cp .env.example .env`, then `nano .env`. Set `PAYLOAD_SECRET` to the output of `openssl rand -hex 32`. Keep `SITE_URL=https://kidztimeschool.com` and `DOMAIN=kidztimeschool.com`. Never share this file.
3. `mkdir -p data && sudo chown -R 1000:1000 data`

## 4. First start (private, not yet on the internet)
```
docker compose build
docker compose up -d app
docker compose run --rm app npx payload run scripts/seed.ts
```
The seed step loads the school's details and photos. Then create the administrator **before** the site is public, because the first account created becomes the administrator:
1. From your main computer: `ssh -L 3000:localhost:3000 YOURUSER@LAPTOP_LOCAL_IP`
2. Open http://localhost:3000/admin in your browser and create the account with a long, unique password.
3. Create the second staff member under Users with the role **Editor**.
4. Check the private site works: `docker compose run --rm -e BASE_URL=http://app:3000 app node scripts/smoke.mjs`. Every line should say PASS.

## 5. Backups (set up now, not later)
```
sudo apt -y install cron
crontab -e
```
Add this line (daily at 2 am; replace the USB path, or delete `BACKUP_EXTRA=...` for now):
```
0 2 * * * cd ~/kidztime-site && BACKUP_EXTRA=/mnt/usb/kidztime ./deploy/backup.sh >> backup.log 2>&1
```
Each backup holds the database (all content, enquiries, users) and every uploaded photo, and the last 30 days are kept. **A backup on the same laptop is not enough**: plug in a USB drive, copy the `backups` folder to it weekly, and keep the drive somewhere else. Test now: `./deploy/backup.sh`.

**Restoring** (after a failure, or to practise):
```
docker compose down
mv data data.old && mkdir data
tar -xzf backups/kidztime-YYYYMMDD-HHMM.tar.gz -C data && sudo chown -R 1000:1000 data
docker compose up -d
```
Practise a restore once before launch.

## 6. Router
In your router's "Port forwarding" page, forward **TCP 80 and TCP 443** (and UDP 443 if offered) to the laptop's fixed local address. Forward nothing else.

## 7. Go public
1. In GoDaddy, open your domain's **DNS** page. Edit the existing `A` record for `@` and set it to your public IP (value from step 1). Add or edit an `A` record for `www` with the same IP. Remove any "Parked" or forwarding entries. TTL 600 seconds is fine.
2. Wait about 10 minutes. Start the secure web server: `docker compose up -d`, then watch `docker compose logs -f caddy`. It should report that it obtained a certificate.
3. **From a phone on mobile data (not your wifi)**, open https://kidztimeschool.com. Some routers cannot open your own site from inside your home network, which is normal.
4. Run the same check against the live address: `docker compose run --rm -e BASE_URL=https://kidztimeschool.com app node scripts/smoke.mjs` (if it fails only here, your router may not loop back to itself; use a phone on mobile data instead).
5. Test by hand: every page, the gallery viewer, an enquiry form (then check it in Admin, Enquiries), admin login, uploading a photo, and publishing a news post. Check on a phone and a computer.

## 7b. Optional: e-mail alerts for new enquiries
Enquiries always appear in Admin, Enquiries. To also get an e-mail for each one, use the school's Gmail:
1. In the Google Account of kidztimeschool@gmail.com turn on 2-Step Verification, then create an **App password** (Security, App passwords).
2. In `.env` set `NOTIFY_EMAIL=kidztimeschool@gmail.com`, `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`, `SMTP_USER=kidztimeschool@gmail.com`, `SMTP_PASS=` (the app password) and `SMTP_FROM=kidztimeschool@gmail.com`.
3. `docker compose up -d` to apply, then send a test enquiry. If no e-mail arrives, check `docker compose logs --tail 50 app`. A failed e-mail never loses the enquiry. This path uses Google's mail servers, so leave it blank if you want zero outside services. I could not test it against a real mailbox.

## 8. If your public IP changes (dynamic IP only)
GoDaddy restricted its DNS API in 2024. A recent report says accounts with one or more domains qualify again, but test it yourself:
1. Create a Production key at developer.godaddy.com/keys.
2. Test: `curl -s -H "Authorization: sso-key KEY:SECRET" https://api.godaddy.com/v1/domains/kidztimeschool.com/records/A/@`
3. If you see your record, it works. Save `GODADDY_KEY`, `GODADDY_SECRET` and `DOMAIN` in `/etc/kidztime-ddns.env` (`sudo chmod 600` it) and add a cron line: `*/5 * * * * /home/YOURUSER/kidztime-site/deploy/ddns.sh >> /var/tmp/ddns.log 2>&1`.
4. If you see `ACCESS_DENIED`, the API is unavailable to you. Ask the provider for a static IP instead.

The script looks up your IP using api.ipify.org, a small outside lookup. The GoDaddy key can edit all DNS on your account, so keep that file private.

## 9. Updating the site
- **Content** (news, photos, programs, text): staff use `/admin`. Changes are live at once.
- **Code changes**: take a backup (`./deploy/backup.sh`), copy the new zip over, then `unzip -o NEWFILE.zip -d ~ && cd ~/kidztime-site && docker compose up -d --build`. Your `.env`, `data` and `backups` are never touched, and database changes apply automatically.

## 9b. Security notes
- Public pages send a content-security policy (set in `deploy/Caddyfile`). If a page ever looks broken after an update, open the browser's developer console; messages mentioning "Content Security Policy" point to it. You can switch it off temporarily by putting `#` in front of that one `header @public` line and running `docker compose restart caddy`.
- The admin panel and `/api` are not covered by that policy on purpose, so the admin can never be broken by it.
- Check for security updates every few months: from the project folder run `docker compose run --rm app npm audit --omit=dev`, and ask me for an updated codebase when serious findings appear.

## 10. Keeping it healthy
- Check weekly: the site opens on your phone, `docker compose ps` shows `healthy`, and `df -h` shows free disk space.
- `docker compose logs --tail 100 app` shows recent errors.
- Run `sudo apt update && sudo apt upgrade` monthly, and restart with `sudo reboot` after kernel updates.
- Staff should use long unique passwords. The login locks for 10 minutes after 5 wrong attempts.
