# webViper

vipe the web, like a pro, using the webViper!

## webViper in short
*webViper* is a highly configureable element removal/cleaner (not blocker!) for the web.

![teaser-stores-640x400](https://github.com/user-attachments/assets/0087ef71-9ce6-43bf-b38f-f65b427f8c99)

## Usage options for the viper
There are currently two flavours:
- *webViper_userScript.js* for usage with a browser "userscript"-addons like *Tampermonkey*, *Greasemonkey* or alike (currently recommended!)
- *webViper.js* only the javascript code - as foundation for later.. u and me and we will see!

## Filter rules, how to get clearing out working
*webViper* sources have comments, but to make things easy, here they are.
The definition for a website is in `const ruleSet`, here for the news magazine `www.bild.de`.

```javascript
// Small config rules
const ruleSet = {
  // Target 'url' or 'url part': 'www.bild.de' could also translate to 'bild.de', also possible.
  'www.bild.de': {
    // List of keywords to search for and vipe out
    keywords: [
      'Trump',
      'Harry'
    ],
    // List of excludes, "url pathes" or "any other content or word"
    excludes: [
      '/corporate-site/',
      '/corporate/'
    ],
    // Should elements be removed? true / false
    removeElement: true,
    // Target and target container list
    elementContainers: {
      // List of Tags/CSS Selectors and HTML Tag elements with there respective "parent containers", containing them, which should be removed
      a: ['article.stage-teaser', '.news-ticker-item'],
      // OR for only "a" class "stage-teaser__anchor" class "a" elements
      // 'a.stage-teaser__anchor': ['article.stage-teaser', '.news-ticker-item'],
      // And you can use multiple "a." rules if required
      // OR only ".className" / "#id":
      // '.stage-teaser__anchor': ['article.stage-teaser', '.news-ticker-item'],
      img: ['article.stage-teaser']
      // You could also use 'img.className' too like
      // 'img.classNameClass': ['article.stage-teaser']
    }
  }, {
    'anotherURL2rule.net': {
      .....
    }
  }
}
```
### Help
Please create a issue, with the ***website url*** and the ***keyword(s)*** which you want to be viped out.

**Note:** If the website changes/updates in between, you might - in advance - add two screenshots. One screenshot of page in your browser showing the content in question and one with the HTML markup with the offending content in HTML inside the *webdeveloper console*. Usually the *webdeveloper console* can be opend using `F12`-key in your browser.

The issue can be reported at *issues*: https://github.com/jrie/webViper/issues

## Credits and kudos - shoutout!
Everyone at the *Laucharme* - we are a private group in **Telegram**, but if you know German or English, we can surely arrange a invite if you are keen to get in touch: We are *cool*, of course!

### And this fantastic cover art?
The source of the nice viper image is of *[https://reptilesmagazine.com](https://reptilesmagazine.com)* - I just made some post artwork. 
