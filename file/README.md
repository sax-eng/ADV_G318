# File Directory

Used to store project static assets in a single place.

## Structure

- `images/`
  - Daily check-in photos, cover images, and route-related images
- `gpx/`
  - Main route tracks, backup tracks, and segmented GPX files

## Current Note

This site currently runs as a static GitHub Pages site.

That means:

- The image upload feature currently stores data in browser local storage
- GPX import is also read locally in the browser
- Uploaded files are not automatically written back into this project directory

If you later want uploads to be automatically archived into the project directory or repository, you need one of:

- local desktop file-write capability, or
- a server-side upload API, or
- GitHub API based file commits
