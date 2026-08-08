# DSU UNI SYNC - Project Brain

## Overview
This project contains a single-page timetable application (`DSU_Sem5_Timetable_Site.html`) for the 5th Semester Computer Science and Engineering (CSE) department at Dayananda Sagar University (DSU) for the Odd semester (2026-27). 

The application is a standalone, vanilla HTML, CSS, and JavaScript tool designed to help students track their schedules and find common free time across different sections.

## Architecture
- **Tech Stack:** Vanilla HTML5, CSS3, and JavaScript (ES6+). No external frameworks or libraries are used.
- **Styling:** Custom CSS with CSS variables (`--paper`, `--card`, `--ink`, etc.) for consistent theming. Uses Google Fonts: `Fraunces`, `IBM Plex Sans`, and `IBM Plex Mono`.
- **Data Storage:** All timetable data (sections, courses, faculties, periods) is hardcoded within the `<script>` tag as JavaScript objects and arrays.

## Key Features
1. **Sync Finder:** 
   - Allows users to select two different sections (e.g., Section A and Section B) and compares their schedules.
   - Calculates overlapping free or "skippable" time slots to help students find time for extracurricular activities, MOOCs, library sessions, etc.
   - Ranks the best overlapping windows based on priority.
2. **Section Timetable:** 
   - Displays the weekly schedule for a chosen section.
   - Shows the assigned faculty, room number, and lab batches for each course.
   - Uses color-coded categories (e.g., Free, Skippable, Core Class/Lab) to visually organize the timetable.
3. **Electives:**
   - Lists all available Professional Elective I (PE-1) courses and their corresponding faculty and rooms.

## Data Structure
- `PERIODS`: Array of objects defining the start and end times of the 7 daily periods.
- `DAYS`: Array of the 6 working days (Monday to Saturday).
- `SECTIONS`: A master object where keys are section letters (A to L). Each section contains:
  - `advisor`: The faculty advisor.
  - `room`: The primary classroom.
  - `days`: An object mapping each day to an array of 7 class/lab labels.
  - `courses`: Detailed breakdown of courses, faculty, and lab groups.
- `ELECTIVES`: Array containing the available PE-1 options.

## Potential Future Enhancements
- **Dynamic Data:** Move the hardcoded timetable data into a separate JSON file or fetch it from an API/backend.
- **Responsive Design:** Ensure the grid displays perfectly on all mobile devices (currently has some basic responsive media queries).
- **Export Feature:** Allow users to export or download their synced timetable as a PDF or image.
- **PWA Capabilities:** Add a manifest and service worker to make it an installable Progressive Web App.
