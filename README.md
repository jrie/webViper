# webViper

![teaser-stores-640x400](https://github.com/user-attachments/assets/0087ef71-9ce6-43bf-b38f-f65b427f8c99)

## webViper in short
webViper a versatile, and easy to use web cleaner based on rule sets. There are example rules for Gog.com.
Filter rules and keywords can be set for each website individually. Global keywords can be used for all website defined rules.

*Note:* In the "addon" version, there is a easy **Import Rulesets** function.. for testing. ;)


## Usage options
- as experimental *addon* (currently disabled, because broken and outdated!) for [Firefox](https://addons.mozilla.org/en-US/firefox/addon/webviper/)
- *webViper-userScript.js* for usage with a browser "userscript"-addons like *Firemonkey* user script and css manager

## Filter rules, how to get clearing out working

The definition for a website is in `const baseRuleSet = { ... }`, here an example:

**Note:** This is not valid JSON for import of a rule, for a JSON example, refer to: `webViper-rule-template.json`


```javascript
/ ---------------------------------------------------------------------------------------
// webpage example rule with notes - use "webViper-rule-template.json" instead for copy and paste!
// --------------------------------------------------------------------------------------
'gog.com': {
  keywords: ['in library', 'in der bibliothek'],
  excludes: [],
  removeElement: true,    // Should we do something if found?
  showUnhide: true,       // Should elements be available for unhiding using mouseover?
  animateUnhide: true,    // Should there be a animation when unhiding on mouseover?
  elementContainers: {
      'span.product-label__text': [          // This is the source where the "keywords" appear in
          '.swiper-slide:has(big-spot)',     // This is a parent container, which should be replaced
          '.paginated-products-grid ~ a.product-tile',    // Another parent
          'products-section-layout ~ a.product-tile',     // Order can matter.
          'product-tile:has(store-picture)',
      ],
  },
  // MutationObserver Directive
  // Very much experiemental, not in UI yet, in short, clean viped elements during data change on the website.
  //
  // If element in observerContainers:
  // "key" (css selector parent) change from [ "mutation observer type", remove viped elements in "(css) target"]
  //
  // What it does, call a clearing routine and also (re)attach mutation observers to the nodes accordingly.
  // This is purely optional.
  //
  observerContainers: {
      // c => childList // THIS
      // a => attributes // AND/OR THIS
      // s => subtree // Optional
      '.paginated-products-grid': ['c', 'paginated-products-grid']
  },
};
// -----------------------------------------------------------------------------------
// webpage rules end - stop editing here
// -----------------------------------------------------------------------------------
```

### Rule template for usage as userscript
For easier editing, the file `webViper-rule-template.json` contains a basic template for easy copy and paste into the userscript.

**Note:** There is also a ***Import Rulesets*** functionality in the addon UI version if you want to swap rules easily. :)


## Help, support and issues or bugs
**Note:** There is sometimes helpful output in the *web developer console*. Usually the *webdeveloper console* can be opened using, the `F12`-key from within your browser (Firefox, Chrome...).
In case of help for websites, you can open a issue with the **url** (of course!) and a example keyword and at best, a screenshot where the content appears on the website!

Issue can be reported at *issues*: https://github.com/jrie/webViper/issues

## Credits and kudos - shoutout!
Everyone at the *Laucharme* for bearing with me/us.. ;)

### And this fantastic cover art?
The source of the nice viper image is of *[https://reptilesmagazine.com](https://reptilesmagazine.com)* - I just made some post artwork.
