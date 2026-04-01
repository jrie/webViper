# webViper

![teaser-stores-640x400](https://github.com/user-attachments/assets/0087ef71-9ce6-43bf-b38f-f65b427f8c99)

## webViper in short
webViper a versatile, and easy to use web cleaner based on rule sets. There are example rules for German news websites.
Filter rules and keywords can be set for each website individually. Global keywords can be used for all website defined rules.

## Usage options
- as experimental *addon* for [Firefox](https://addons.mozilla.org/en-US/firefox/addon/webviper/)
- *webViper-userScript.js* for usage with a browser "userscript"-addons like *Firemonkey* user script and css manager

## Filter rules, how to get clearing out working

The definition for a website is in `const baseRuleSet = { ... }`, here an example:

```javascript
//
// Rule template for "webViper" --> https://github.com/jrie/webViper
// for easier addition, just fill to get started..
//
// -----------------------------------------------------------------------------------
// webpage rules start
// -----------------------------------------------------------------------------------
let baseRuleSet = {
  // Start adding changes in here
  'gog.com': {
      keywords: ['in library', 'in der bibliothek'],
      excludes: [],
      removeElement: true,
      showUnhide: true,       // Should elements be available for unhiding using mouseover?
      animateUnhide: true,    // Should there be a animation when unhiding on mouseover?
      elementContainers: {
          ' ': [
              '.swiper-slide:has(big-spot)',
              '.paginated-products-grid ~ a.product-tile',
              'products-section-layout ~ a.product-tile',
              'product-tile:has(store-picture)',
          ],
      },
      // Very much experiemental, not in UI yet, in short, clean viped elements:
      // if element in observerContainers: "key" (css selector) change from [ "type", out of "(css) target"]
      //
      // What it does, call a clearing routine and also (re)attach mutation observers to the nodes.
      observerContainers: {
          // c => childList // THIS
          // a => attributes // OR THIS
          // s => subtree // Optional
          '.paginated-products-grid': ['c', 'paginated-products-grid'],
      },
  },
  globalKeywords: [],
};
// -----------------------------------------------------------------------------------
// webpage rules end - stop editing here
// -----------------------------------------------------------------------------------
```

### Rule template for usage as userscript
For easier editing, the file `webViper-rule-template.js` contains a basic template for easy copy and paste into the userscript.

## Help, support and issues or bugs
Please create a issue, with the ***website url*** and the ***keyword(s)*** which you want to be viped out.

**Note:** If the website changes/updates in between, you might - in advance - add two screenshots. One screenshot of page in your browser showing the content in question and one with the HTML markup with the offending content in HTML inside the *webdeveloper console*. Usually the *webdeveloper console* can be opened using, usually, the `F12`-key from within your browser (Firefox, Chrome...).

The issue can be reported at *issues*: https://github.com/jrie/webViper/issues

## Credits and kudos - shoutout!
Everyone at the *Laucharme* - we are a private group in **Telegram**, but if you know German or English, we can surely arrange a invite if you are keen to get in touch: We are *cool*, of course!

### And this fantastic cover art?
The source of the nice viper image is of *[https://reptilesmagazine.com](https://reptilesmagazine.com)* - I just made some post artwork. 
