# Tokyo

Website concept by Ahmed Fakhreldin.

Static site: `index.html`, `menu.html`, `reserve.html` (`visit.html` forwards to it), `site.css`, `app.js`, `fonts.css`, `fonts/`, `img/`. Open `index.html` through any static server; no build step is needed.

## Reservation form

Every "Book your table" link on the site lands on the block with `id="reservation"` (on the home page and on `reserve.html`). Until a form exists, that block shows WhatsApp (with a prefilled table request) and Call buttons, so it works today.

Two ways to plug the form in, either one is enough:

1. **Form address.** Open `app.js` and set the one line at the top:

   ```js
   const RESERVATION_FORM_URL = "https://example.com/your-form";
   ```

   The block then loads that address in a full-width, lazy-loaded frame (border-less, 780 px tall on desktop, 840 px on phones, titled "Reserve a table at Tokyo") and keeps WhatsApp and Call as two small links underneath. Change the height in `site.css` (`.resv__frame`) if the form needs more room.

2. **Embed snippet.** Paste the snippet the form provider gives you inside the marked container, in both `index.html` and `reserve.html`:

   ```html
   <div class="resv__embed" data-resv-embed>
   <!-- paste the embed snippet here -->
   </div>
   ```

   As soon as the container holds an element, it is shown and the WhatsApp and Call buttons step aside (they remain as the two small links).

Leave `RESERVATION_FORM_URL` empty (`""`) to go back to WhatsApp and Call.

## Cache version

Every css and js link ends in `?v=1`. Raise the number in all four pages when you publish a change.
