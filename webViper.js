// -----------------------------------------------------------------------------------
// Small config

// This will output some more information to debug console if enabled
// otherwise only log console statements are used
const doDebug = false;

// -----------------------------------------------------------------------------------
// webpage rules start
// -----------------------------------------------------------------------------------
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
    removeElement: true,
    elementContainers: {
      a: ['li', 'article'],
      h2: ['div.shrink-0', 'article']
    }
  },

  'www.stern.de': {
    keywords: [

    ],
    excludes: [

    ],
    removeElement: true,
    elementContainers: {
      a: ['article.teaser', 'article.teaser-opulent', 'article.teaser-plaintext']
    }
  },

  'www.focus.de': {
    keywords: [

    ],
    excludes: [

    ],
    removeElement: true,
    elementContainers: {
      'div#topArticleTitle': ['div#topArticle'],
      a: ['li[data-vr-contentbox=""]'],
      'a.ps-hover': ['article.promo'],
      h3: ['li']

    }
  },

  'taz.de': {
    keywords: [

    ],
    excludes: [

    ],
    removeElement: true,
    elementContainers: {
      a: ['a.pr-smAall', 'div.column'],
      h2: ['section.columns'],
      h3: ['section.columns']
    }
  },

  globalKeywords: [

  ]
};
// -----------------------------------------------------------------------------------
// webpage rules end - stop editing here
// -----------------------------------------------------------------------------------

// -----------------------------------------------------------------------------------
const currentPageLocation = window.location.href.toLocaleLowerCase();
const outputConsole = doDebug ? console.debug : console.log;

// -----------------------------------------------------------------------------------
function replaceElement (keyword, toReplace) {
  if (toReplace.parentNode) {
    const keyword = 'webViper';
    const replacement = document.createElement(toReplace.nodeName.toLocaleLowerCase());
    replacement.className = toReplace.className + ' vipered';
    replacement.style.width = toReplace.clienWidth + 'px';
    replacement.style.height = toReplace.clienHeight + 'px';
    replacement.style.border = toReplace.style.border ? toReplace.style.border : '1px dashed black';
    replacement.style.textAlign = 'left';
    replacement.style.padding = '0.5rem 1rem';
    replacement.innerHTML = '<span style="color: #666;">This item was viped by<br><span style="color: red; font-weight: bold; font-size: 1.65rem;">' + keyword + '</span></span>';
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
function doParse (removedByKeywords, targetContainers, targetExcludes, targetHasExcludes, targetRemove) {
  for (const containerKey of Object.keys(targetContainers)) {
    const targets = document.querySelectorAll(containerKey);
    if (targets.length === 0) {
      outputConsole('[webViper] [ RUN ] [ PARSE ] No \'targets\' found for selector: \'' + containerKey + '\'');
      continue;
    }

    let excludeCount = 0;
    for (const nodeElement of targets) {
      let parentContainer = null;
      for (const nodeElmentParentContainer of targetContainers[containerKey]) {
        parentContainer = nodeElement.closest(nodeElmentParentContainer);
        if (parentContainer) {
          break;
        }
      }

      if (!parentContainer) {
        if (doDebug) {
          outputConsole('[webViper] [ DEBUG ] [ PARSE ] No \'parentContainer\' found for selector: \'' + containerKey + '\'');
        }

        continue;
      }

      const data = parentContainer.innerHTML.toLocaleLowerCase();

      let hasExclude = false;
      if (targetHasExcludes) {
        for (const exclude of targetExcludes) {
          if (data.indexOf(exclude) > -1) {
            hasExclude = true;
            ++excludeCount;
            break;
          }
        }

        if (hasExclude) {
          continue;
        }
      }

      if (targetRemove) {
        for (const keyword of Object.keys(removedByKeywords)) {
          const keywordLower = keyword.toLocaleLowerCase();
          if (data.indexOf(keywordLower) > -1) {
            if (replaceElement(keyword, parentContainer)) {
              ++removedByKeywords[keyword];
            }

            break;
          }
        }
      }
    }

    if (excludeCount !== 0) {
      outputConsole('[webViper] [ RUN ] [ PARSE ] Excluded for \'' + containerKey + '\' --->' + excludeCount);
    }
  }
}

// -----------------------------------------------------------------------------------
if (doDebug) {
  outputConsole('[webViper] [ DEBUG START ] -----------------------------------');
}

outputConsole('[webViper] [ RUN ] Start.');

const removedByKeywords = {};
for (const url of Object.keys(ruleSet)) {
  if (currentPageLocation.indexOf(url) > -1) {
    outputConsole('[webViper] [ RUN ] Rule matched for: ' + url);

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

    if (doDebug) {
      outputConsole('[webViper] [ DEBUG ] global keywords    : ', globalKeywords);
      outputConsole('[webViper] [ DEBUG ] rule               : ', targetUrl);
      outputConsole('[webViper] [ DEBUG ] keywords           : ', targetKeywords);
      outputConsole('[webViper] [ DEBUG ] elementContainers  : ', targetContainers);
      outputConsole('[webViper] [ DEBUG ] excludes           : ', targetExcludes);
    }

    createKeywordsRemovalDict(removedByKeywords, globalKeywords);
    createKeywordsRemovalDict(removedByKeywords, targetKeywords);

    doParse(removedByKeywords, targetContainers, targetExcludes, targetHasExcludes, targetRemove);
    break;
  }
}

let vipedByViper = 0;
for (const key of Object.keys(removedByKeywords)) {
  const amount = removedByKeywords[key];
  if (amount > 0) {
    outputConsole('[webViper] Removed for keyword  : ' + key + ' ----> ' + amount);
    vipedByViper += amount;
  }
}

outputConsole('[webViper] [ RUN ] Run end.' + (vipedByViper !== 0 ? (' Viped items: ' + vipedByViper) : ' No viped items.'));

if (doDebug) {
  outputConsole('[webViper] [ DEBUG END ] -------------------------------------');
}
