// ==UserScript==
// @name         webViper
// @namespace    webViper
// @version      2025-01-26
// @description  vipe the web, like a pro, using the webViper
// @author       Jan Riechers
// @match        http*://
// @run-at       document-end
// @supportURL   https://github.com/jrie/webViper
// @grant        none
// ==/UserScript==

// Small config
const ruleSet = {
  // Target 'url' or 'url part': 'www.bild.de' could also translate to 'bild.de'
  'www.bild.de': {
    // List of keywords to search for and vipe out
    keywords: [
      'Trump',
      'Harry'
    ],
    // List of excludes, "url pathes" or "any other content or word"
    excludes: [ //
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
  },
  'www.spiegel.de': {
    keywords: [
      'Trump',
      'Harry'
    ],
    excludes: [
      // empty
    ],
    elementContainers: {
      a: ['li', 'article'],
      h2: ['div.shrink-0', 'article']
    },
    removeElement: true
  },
  'taz.de': {
    keywords: [
      'Trump',
      'Harry'
    ],
    excludes: [
      // empty
    ],
    elementContainers: {
      a: ['a.pr-small', 'div.column'],
      h2: ['section.columns'],
      h3: ['section.columns']
    },
    removeElement: true
  },
  // Not used yet
  globalKeywords: []
};

// Change this for local testing comment out "const currentPageLocation = window.location.href.toLocaleLowerCase();":
// use "const currentPageLocation = 'www.bild.de';" // Replace "www.bild.de" with ruleSet name for the page you want to adapt
const currentPageLocation = window.location.href.toLocaleLowerCase();
// const currentPageLocation = 'www.bild.de';

// Main cleaner routine
function replaceElement (keyword, toReplace) {
  if (toReplace.parentNode) {
    const replacement = document.createElement(toReplace.nodeName.toLocaleLowerCase());
    replacement.className = toReplace.className + ' vipered';
    replacement.style.width = toReplace.clienWidth + 'px';
    replacement.style.height = toReplace.clienHeight + 'px';
    replacement.style.border = toReplace.style.border ? toReplace.style.border : '1px dashed black';
    replacement.style.textAlign = 'left';
    replacement.style.padding = '0.5rem 1rem';
    replacement.innerHTML = '<span style="color: #666;">This item was viped by<br><span style="color: red; font-weight: bold; font-size: 1.65rem; text-transform: capitalize;">' + keyword + '</span></span>';
    toReplace.parentNode.replaceChild(replacement, toReplace);
    return true;
  }

  return false;
}

function doParse (targetKeywords, targetContainers, targetExcludes, targetHasExcludes, targetRemove) {
  let removedByParse = 0;
  for (const containerKey of Object.keys(targetContainers)) {
    const targets = document.querySelectorAll(containerKey);
    for (const nodeElement of targets) {
      let parentContainer = null;
      for (const nodeElmentParentContainer of targetContainers[containerKey]) {
        parentContainer = nodeElement.closest(nodeElmentParentContainer);
        if (parentContainer) {
          break;
        }
      }

      if (!parentContainer) {
        continue;
      }

      const data = parentContainer.innerHTML.toLocaleLowerCase();

      let hasExclude = false;
      if (targetHasExcludes) {
        for (const exclude of targetExcludes) {
          if (data.indexOf(exclude) > -1) {
            hasExclude = true;
            break;
          }
        }

        if (hasExclude) {
          continue;
        }
      }

      if (targetRemove) {
        let isReplaced = false;

        for (const keyword of targetKeywords) {
          const keywordLower = keyword.toLocaleLowerCase();
          if (data.indexOf(keywordLower) > -1) {
            isReplaced = replaceElement(keyword, parentContainer);
            break;
          }
        }
        if (isReplaced) {
          ++removedByParse;
        }
      }
    }
  }

  return removedByParse;
}

let removedItems = 0;
for (const url of Object.keys(ruleSet)) {
  if (currentPageLocation.indexOf(url) > -1) {
    const targetUrl = url;
    let targetKeywords = [];
    let targetContainers = {};
    let targetExcludes = [];
    let targetHasExcludes = false;
    let targetRemove = false;

    if (Object.hasOwn(ruleSet[targetUrl], 'keywords')) {
      targetKeywords = ruleSet[targetUrl].keywords;
    }

    if (Object.hasOwn(ruleSet[targetUrl], 'elementContainers')) {
      targetContainers = ruleSet[targetUrl].elementContainers;
      for (const targetContainerSelector of Object.keys(targetContainers)) {
        if (targetContainerSelector.length === 0) {
          targetContainers[targetContainerSelector] = ['div'];
        }
      }
    }

    if (Object.hasOwn(ruleSet[targetUrl], 'excludes')) {
      if (ruleSet[targetUrl].excludes.length !== 0) {
        targetExcludes = ruleSet[targetUrl].excludes;
        targetHasExcludes = true;
      }
    }

    if (Object.hasOwn(ruleSet[targetUrl], 'removeElement') && ruleSet[targetUrl].removeElement) {
      targetRemove = true;
    }

    removedItems += doParse(targetKeywords, targetContainers, targetExcludes, targetHasExcludes, targetRemove);
    break;
  }
}

console.log('webViper DEBUG: Viped run succesfull, removed items:', removedItems);
if (removedItems !== 0) {
  // window.alert('Viped items: ' + removedItems);
}
