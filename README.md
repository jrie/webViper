# webViper

![teaser-stores-640x400](https://github.com/user-attachments/assets/0087ef71-9ce6-43bf-b38f-f65b427f8c99)

## webViper in short
webViper a versatile, and easy to use web cleaner based on rule sets. There are example rules for German news websites.
Filter rules and keywords can be set for each website individually. Global keywords can be used for all website defined rules.

## Usage options
- as experimental *addon* for [Firefox](https://addons.mozilla.org/en-US/firefox/addon/webviper/)
- *webViper-userScript.js* for usage with a browser "userscript"-addons like *Tampermonkey*, *Violentmonkey*

## Screenshot of a wiped item
![screenshot_webviper_removed_item](https://github.com/user-attachments/assets/3479e800-1974-41cb-ad19-dd12c22c0917)


## Filter rules, how to get clearing out working
There are example rules for: "www.bild.de", "www.focus.de", "www.spiegel.de", "www.stern.de", or "www.taz.de".
*webViper* sources have comments, but to make things easy, here they are.


The definition for a website is in `const ruleSet = { ... }`, here an example:

```javascript
//
// Small config rules inside "ruleSet"
//
// const ruleSet = {
//
    // A url which identifies the website
    'websiteURL.net': {
        keywords: [
            // 'keyword1',
            // 'keyword2',
        ],
        excludes: [
            // Can be empty
            // 'exlucde1',
            // 'exlucde2'
        ],
        elementContainers: {
            // CSSselector1: ['cssSelectorParent1', 'cssSelectorParent2'],
            // CSSselector2: ['cssSelectorParent1', 'cssSelectorParent2']
            //
            // For example:
            // a: ['article.stage-teaser', '.news-ticker-item'],
            // 'a.stage-teaser__anchor': ['article.stage-teaser', '.news-ticker-item'],
            // 'img.classNameClass': ['article.stage-teaser']
            //
            // You could also use:
            // 'img#id': ['.className1', '#id']
            // 'img.className': ['.className1', '#id']
            //
        },
        removeElement: true
    }
//
// }
//
```

### Rule template for usage as userscript
For easier editing, the file `webViper-rule-template.js` contains a basic template for easy copy and paste into the userscript.


## Video guide on how to add new rules
A video demonstration how to add and extend the `ruleSet` rules and identify a cleaning item.

https://github.com/user-attachments/assets/6d8ade11-f793-46f5-a692-fbe1cdf35888


## Help, support and issues or bugs
Please create a issue, with the ***website url*** and the ***keyword(s)*** which you want to be viped out.

**Note:** If the website changes/updates in between, you might - in advance - add two screenshots. One screenshot of page in your browser showing the content in question and one with the HTML markup with the offending content in HTML inside the *webdeveloper console*. Usually the *webdeveloper console* can be opened using, usually, the `F12`-key from within your browser (Firefox, Chrome...).

The issue can be reported at *issues*: https://github.com/jrie/webViper/issues

## Credits and kudos - shoutout!
Everyone at the *Laucharme* - we are a private group in **Telegram**, but if you know German or English, we can surely arrange a invite if you are keen to get in touch: We are *cool*, of course!

### And this fantastic cover art?
The source of the nice viper image is of *[https://reptilesmagazine.com](https://reptilesmagazine.com)* - I just made some post artwork. 
