# Tokyo

Static site: `index.html`, `menu.html`, `reserve.html` (`visit.html` forwards to it), `site.css`, `app.js`, `fonts.css`, `fonts/`, `img/`. Open `index.html` through any static server; no build step is needed.

## Reservation form

Every "Book a table" and "Reservations" link on the site lands on the block with `id="reservation"` (on the home page and on `reserve.html`). Until the form is ready, the block shows a space of the same size with "Online booking opens soon." and a phone link.

Two ways to plug the form in, either one is enough:

1. **Form address.** Open `app.js` and set the one line at the top:

   ```js
   const RESERVATION_FORM_URL = "https://example.com/your-form";
   ```

   The block then loads that address in a full-width, lazy-loaded frame (border-less, 780 px tall on desktop, 840 px on phones, titled "Reserve a table at Tokyo") and keeps a small Call link under it. Change the height in `site.css` (`.resv__frame`) if the form needs more room.

2. **Embed snippet.** Paste the snippet the form provider gives you inside the marked container, in both `index.html` and `reserve.html` (it sits in the card on the right of the "Book a table" block):

   ```html
   <div class="resv__embed" data-resv-embed>
   <!-- paste the embed snippet here -->
   </div>
   ```

   As soon as the container holds an element, it is shown and the placeholder steps aside (a small Call link stays under the form).

Leave `RESERVATION_FORM_URL` empty (`""`) to go back to the placeholder.

## Cache version

Every css and js link ends in `?v=3`. Raise the number in all the pages (`index.html`, `menu.html`, `reserve.html`) when you publish a change to `site.css` or `app.js`.
