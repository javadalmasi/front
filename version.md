# Version 1.0.2

## Changelog

*   **Bug Fix:**
    *   Fixed a critical bug that caused the new homepage to crash and display a blank page. The issue was caused by an incorrect prop name being passed to the `VideoItem` component and a lack of data validation.

# Version 1.0.1

## Changelog

*   **New Homepage:**
    *   The default homepage has been replaced with a dynamic feed of videos from a curated list of channels, displayed in horizontally-scrolling carousels.
    *   Added sections for "Shorts" and "Watched Items".
    *   Added sorting tabs for "Most Viewed" and "Latest", with "Latest" as the default.
    *   The list of channels is now configurable in `src/channels.js`.
*   **Preferences:**
    *   Removed the obsolete "Default Homepage" setting.
    *   Enabled "Store Watch History" by default.
*   **Localization:**
    *   Translated new UI elements on the homepage to Persian.
*   **UI/UX:**
    *   Styled sorting tabs as rounded buttons.
    *   Made video items on the homepage draggable for reordering.
    *   Ensured the logo in the navbar links to the new homepage.
*   **Technical:**
    *   Implemented CDN support for video thumbnails.

# Version 1.0.0

## Changelog

*   Fixed uneven spacing between menu items in the semi-open sidebar.

## Git Version

*   **Commit SHA:** `(will be updated after commit)`
