# GeoTag Camera Web App

A powerful full-stack React application to capture, upload, and overlay custom GPS and timestamp data on photos.

## Features

- **Frontend Image Processing**: Completely local image manipulation using HTML Canvas for maximum privacy and performance.
- **Custom Overlays**: Add latitude, longitude, address, custom notes, and timestamps on images.
- **Map Selection**: Fully interactive map using Leaflet and Nominatim OpenStreetMap search.
- **Backend Image Processing**: (Optional) Express backend with Sharp integration for alternative heavy image processing.

## Requirements

- Node.js 18+

## Setup & Running Locally

### 1. Frontend (Client)

1. Navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the web app at `http://localhost:5173`.

### 2. Backend (Server - Optional)

The server provides a placeholder endpoint for server-side Sharp processing if needed (`POST /api/process-image`).

1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Express server:
   ```bash
   node server.js
   ```
4. The API will run on `http://localhost:5000`.

## Technologies Used

- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide React, React-Leaflet, html2canvas
- **Backend**: Node.js, Express, Multer, Sharp
