import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const startLat = searchParams.get("startLat");
  const startLng = searchParams.get("startLng");
  const endLat = searchParams.get("endLat");
  const endLng = searchParams.get("endLng");

  if (!startLat || !startLng || !endLat || !endLng) {
    return NextResponse.json({ error: "Missing coordinates" }, { status: 400 });
  }

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || process.env.MAPBOX_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "Missing Mapbox token" }, { status: 500 });
  }

  const themeParam = (searchParams.get("theme") || "light").toLowerCase();
  const styleId = themeParam === "dark" ? "dark-v11" : "light-v11";
  const baseUrl = `https://api.mapbox.com/styles/v1/mapbox/${styleId}/static`;

  // Compute a center and zoom that fit both points nicely
  const startLatNum = Number(startLat);
  const startLngNum = Number(startLng);
  const endLatNum = Number(endLat);
  const endLngNum = Number(endLng);

  const width = 600;
  const height = 400;
  const paddingPx = 48;
  const tileSize = 512;

  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
  const projectX = (lng: number) => (lng + 180) / 360;
  const projectY = (lat: number) => {
    const sin = Math.sin((lat * Math.PI) / 180);
    const y = 0.5 - (0.25 * Math.log((1 + sin) / (1 - sin))) / Math.PI;
    return clamp(y, 0, 1);
  };

  const x1 = projectX(startLngNum);
  const y1 = projectY(startLatNum);
  const x2 = projectX(endLngNum);
  const y2 = projectY(endLatNum);

  const dx = Math.abs(x1 - x2);
  const dy = Math.abs(y1 - y2);

  let zoom: number;
  if (dx === 0 && dy === 0) {
    zoom = 12;
  } else {
    const zx = Math.log2((width - 2 * paddingPx) / (tileSize * Math.max(dx, 1e-9)));
    const zy = Math.log2((height - 2 * paddingPx) / (tileSize * Math.max(dy, 1e-9)));
    zoom = Math.floor(Math.min(zx, zy));
    zoom = clamp(zoom, 2, 16);
  }

  const centerLng = (startLngNum + endLngNum) / 2;
  const centerLat = (startLatNum + endLatNum) / 2;

  // Use a GeoJSON overlay for the straight line between points
  const geojson = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {
          "stroke": "#ADD8E6"
        },
        geometry: {
          type: "LineString",
          coordinates: [
            [startLngNum, startLatNum],
            [endLngNum, endLatNum],
          ],
        },
      },
    ],
  } as const;
  const pathOverlay = `geojson(${encodeURIComponent(JSON.stringify(geojson))})`;

  const mapUrl = `${baseUrl}/
    pin-s+808080(${startLngNum},${startLatNum}),
    pin-s+808080(${endLngNum},${endLatNum}),
    ${pathOverlay}
    /${centerLng},${centerLat},${zoom}/${width}x${height}?access_token=${token}`
    .replace(/\s+/g, "");

  return NextResponse.json({ url: mapUrl });
}


