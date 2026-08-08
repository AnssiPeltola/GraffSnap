# GraffSnap

- GraffSnap is mobile-first web application for documenting and tracking graffiti found in public places around Finland.

- The main idea is simple: when a specific graffiti is spotted, the user can save its location on a map, upload a photo, record when it was seen, and optionally add notes. Every saved sighting is then displayed as a marker on an interactive map.

- The application is designed primarily for iPhone and mobile use, so adding a new graffiti sighting should be fast and easy. The user can use the phone's current GPS location or manually choose the location on the map, take or select a photo, and save the sighting in just a few steps.

- The map itself can be publicly visible, allowing visitors to explore previously found graffiti locations and view their photos and details. However, only the authenticated user can add, edit, or delete graffiti sightings.

- The application uses Next.js and TypeScript for the frontend and backend, Neon PostgreSQL for storing graffiti data and coordinates, Leaflet for the interactive map, Cloudinary for image storage and optimization, and Vercel for deployment.

- The goal is to create a simple personal collection and visual history of where the graffiti has been found over time.
