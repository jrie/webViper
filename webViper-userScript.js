// ==UserScript==
// @name         webViper
// @namespace    webViper
// @version      2025-01-26
// @description  vipe the web, like a pro, using the webViper
// @author       Jan Riechers
// @match        http*://*
// @run-at       document-end
// @supportURL   https://github.com/jrie/webViper
// @grant        none
// ==/UserScript==

// Small config
const ruleSet = {
  'www.bild.de': {
    keywords: [
      'Trump',
      'Harry'
    ],
    excludes: [ //
      '/corporate-site/',
      '/corporate/'
    ],
    removeElement: true,
    elementContainers: {
      a: ['article.stage-teaser', '.news-ticker-item', 'div.slider__item'],
      img: ['article.stage-teaser']
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
    ],
    elementContainers: {
      a: ['a.pr-small', 'div.column'],
      h2: ['section.columns'],
      h3: ['section.columns']
    },
    removeElement: true
  },
  globalKeywords: []
};

const currentPageLocation = window.location.href.toLocaleLowerCase();

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
