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

    ],
    excludes: [

    ],
    removeElement: true,
    elementContainers: {
      a: ['article.stage-teaser', '.news-ticker-item', 'div.slider__item'],
      img: ['article.stage-teaser']
    }
  },
  'www.spiegel.de': {
    keywords: [

    ],
    excludes: [

    ],
    elementContainers: {
      a: ['li', 'article'],
      h2: ['div.shrink-0', 'article']
    },
    removeElement: true
  },

  'www.stern.de': {
    keywords: [

    ],
    excludes: [

    ],
    elementContainers: {
      a: ['article.teaser', 'article.teaser-opulent']
    },
    removeElement: true
  },
  'taz.de': {
    keywords: [

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
  globalKeywords: [

  ]
};

// -----------------------------------------------------------------------------------
const currentPageLocation = window.location.href.toLocaleLowerCase();

// -----------------------------------------------------------------------------------
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

// -----------------------------------------------------------------------------------
function createKeywordsRemovalDict (keyWordDict, keywordArray) {
  for (const keyword of keywordArray) {
    if (!Object.hasOwn(keyWordDict, keyword)) {
      keyWordDict[keyword] = 0;
    }
  }
}

// -----------------------------------------------------------------------------------
function doParse (globalKeywords, targetKeywords, targetContainers, targetExcludes, targetHasExcludes, targetRemove) {
  const removedByKeyword = {};

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
        createKeywordsRemovalDict(removedByKeyword, globalKeywords);
        createKeywordsRemovalDict(removedByKeyword, targetKeywords);

        for (const keyword of Object.keys(removedByKeyword)) {
          const keywordLower = keyword.toLocaleLowerCase();
          if (data.indexOf(keywordLower) > -1) {
            if (replaceElement(keyword, parentContainer)) {
              ++removedByKeyword[keyword];
            }

            break;
          }
        }
      }
    }
  }

  return removedByKeyword;
}

// -----------------------------------------------------------------------------------
const removedByKeywords = {};
for (const url of Object.keys(ruleSet)) {
  if (currentPageLocation.indexOf(url) > -1) {
    const targetUrl = url;
    let globalKeywords = [];
    let targetKeywords = [];
    let targetContainers = {};
    let targetExcludes = [];
    let targetHasExcludes = false;
    let targetRemove = false;

    if (Object.hasOwn(ruleSet, 'globalKeywords')) {
      globalKeywords = ruleSet.globalKeywords;
    }

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

    const removedKeywords = doParse(globalKeywords, targetKeywords, targetContainers, targetExcludes, targetHasExcludes, targetRemove);

    for (const key of Object.keys(removedKeywords)) {
      if (Object.hasOwn(removedByKeywords, key)) {
        removedByKeywords[key] += removedKeywords[key];
      } else {
        removedByKeywords[key] = removedKeywords[key];
      }
    }

    break;
  }
}

for (const key of Object.keys(removedByKeywords)) {
  console.log('[DEBUG] webViper removed: "' + key + '" ----> ' + removedByKeywords[key]);
}

console.log('[DEBUG] webViper run successful.');
