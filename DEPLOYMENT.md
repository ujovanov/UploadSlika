# Deployment Guide

This guide will help you deploy your Image Uploader application to a server with a custom domain.

## Prerequisites

- A server with Node.js installed (v14+ recommended)
- A custom domain name
- Basic knowledge of terminal commands

## Build the Application

Before deploying, build the application:

```bash
# Install dependencies
npm install

# Build both frontend and backend
npm run build:all
```

## Files to Upload

Upload the following files to your server:

- `dist/` folder (contains both frontend and compiled backend)
- `node_modules/` folder (or run `npm install` on the server)
- `package.json`
- `uploads/` folder (or create it on the server)
- `.env` file (with your production settings)

## Server Setup

1. **Create a `.env` file** with the following content:

```
PORT=3000
MAX_FILE_SIZE=10485760 # 10MB in bytes
```

You can change the port if needed.

2. **Start the server**:

```bash
npm start
```

For production use, it's recommended to use a process manager like PM2:

```bash
# Install PM2
npm install -g pm2

# Start the application
pm2 start npm --name "image-uploader" -- start

# Make sure it starts on system reboot
pm2 startup
pm2 save
```

## Domain Configuration

### Option 1: Using Nginx as a Reverse Proxy (Recommended)

1. **Install Nginx**:

```bash
sudo apt update
sudo apt install nginx
```

2. **Configure Nginx**:

Create a new site configuration:

```bash
sudo nano /etc/nginx/sites-available/image-uploader
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Increase max upload size
    client_max_body_size 10M;
}
```

3. **Enable the site**:

```bash
sudo ln -s /etc/nginx/sites-available/image-uploader /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

4. **Set up SSL with Let's Encrypt**:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Option 2: Direct Access

If you're using a VPS or dedicated server, you can also:

1. Open the port in your firewall:

```bash
sudo ufw allow 3000
```

2. Access your application directly via `yourdomain.com:3000`

3. For a cleaner URL, update your DNS settings to point to your server and use port forwarding to redirect port 80 to 3000.

## Hosting Recommendations

For easier deployment, consider these hosting options:

1. **Render.com**:
   - Create a Web Service
   - Set build command to `npm run build:all`
   - Set start command to `npm start`
   - Add your custom domain in their dashboard

2. **DigitalOcean App Platform**:
   - Upload your code
   - Set the build command to `npm run build:all`
   - Set the run command to `npm start`
   - Connect your custom domain in their dashboard

3. **Railway.app**:
   - Connect your GitHub repository
   - Set build command to `npm run build:all`
   - Set start command to `npm start`
   - Add your custom domain

## Troubleshooting

- **Application not starting**: Check the logs with `pm2 logs image-uploader`
- **Cannot upload files**: Check folder permissions for the `uploads` directory
- **Domain not working**: Verify DNS settings and wait for propagation (can take up to 48 hours) 