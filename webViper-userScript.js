// ==UserScript==
// @name         webViper
// @version      2026-03-19
// @description  vipe the web, like a pro, using the webViper
// @author       Jan Riechers
// @match        *://*/*
// @grant        none
// @run-at       document-idle
// @website      https://webviper.dwrox.net
// @downloadURL  https://github.com/jrie/webViper
// @supportURL   https://github.com/jrie/webViper/issues
// ==/UserScript==

// -----------------------------------------------------------------------------------
// Small config
// -----------------------------------------------------------------------------------
// This will output some more information to debug console if enabled
// otherwise only log console statements are used
let doDebug = false;
// -----------------------------------------------------------------------------------
// webpage rules start
// -----------------------------------------------------------------------------------
let baseRuleSet = {
  /*
  "gog.com": {
    keywords: ["in library", "in der bibliothek"],
    excludes: [],
    removeElement: true,
    elementContainers: {
      "span.product-label__text": [
        ".swiper-slide:has(big-spot)",
        "products-section-layout ~ a.product-tile",
        "product-tile:has(store-picture)",
      ],
    },
  },
  */
  globalKeywords: [],
};
// -----------------------------------------------------------------------------------
// webpage rules end - stop editing here
// -----------------------------------------------------------------------------------

// -----------------------------------------------------------------------------------
let currentPageLocation = location.href.toLocaleLowerCase();
let outputConsole = doDebug ? console.debug : console.log;

// -----------------------------------------------------------------------------------
function replaceElement(keyword, toReplace) {
  if (toReplace.parentNode) {
    const keyword = "webViper";
    const replacement = document.createElement(
      toReplace.nodeName.toLocaleLowerCase(),
    );
    replacement.className = toReplace.className + " vipered";
    replacement.id = toReplace.id;
    replacement.style = toReplace.style;
    replacement.style.textAlign = "left";
    replacement.style.padding = "1.5vw 1.2vw";
    replacement.style.width = toReplace.clientWidth
      ? toReplace.clientWidth + "px"
      : "auto";
    replacement.style.height = toReplace.clientHeight
      ? toReplace.clientHeight + "px"
      : "auto";
    replacement.style.position = "relative";
    replacement.style.display = "inherit";
    replacement.innerHTML =
      '<span style="color: #666; display: inline-block;">This item was viped by <br><span style="color: red; font-weight: bold; font-size: 1.65vw;">' +
      keyword +
      "</span></span>";

    toReplace.parentNode.style.position = "relative";

    toReplace.parentNode.replaceChild(replacement, toReplace);
    return true;
  }

  return false;
}

// -----------------------------------------------------------------------------------
function createKeywordsRemovalDict(keyWordDict, keywordArray) {
  for (const keyword of keywordArray) {
    if (!Object.hasOwn(keyWordDict, keyword)) {
      keyWordDict[keyword] = 0;
    }
  }
}

// -----------------------------------------------------------------------------------
function doParse(
  removedByKeywords,
  targetContainers,
  targetExcludes,
  targetHasExcludes,
  targetRemove,
) {
  for (const containerKey of Object.keys(targetContainers)) {
    const targets = document.querySelectorAll(containerKey);
    if (targets.length === 0) {
      outputConsole(
        "[webViper] [ RUN ] [ PARSE ] No 'targets' found for selector: '" +
          containerKey +
          "'",
      );
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
          outputConsole(
            "[webViper] [ DEBUG ] [ PARSE ] No 'parentContainer' found for selector: '" +
              containerKey +
              "'",
          );
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
      outputConsole(
        "[webViper] [ RUN ] [ PARSE ] Excluded for '" +
          containerKey +
          "' --->" +
          excludeCount,
      );
    }
  }
}

// -----------------------------------------------------------------------------------
if (doDebug) {
  outputConsole(
    "[webViper] [ DEBUG START ] -----------------------------------",
  );
}

function doVipe() {
  outputConsole("[webViper] [ RUN ] Start.");

  const removedByKeywords = {};
  for (const url of Object.keys(baseRuleSet)) {
    if (currentPageLocation.indexOf(url) > -1) {
      outputConsole("[webViper] [ RUN ] Rule matched for: " + url);

      const targetUrl = url;
      let targetGlobalKeywords = [];
      let targetKeywords = [];
      let targetContainers = {};
      let targetExcludes = [];
      let targetHasExcludes = false;
      let targetRemove = false;

      if (Object.hasOwn(baseRuleSet, "globalKeywords")) {
        targetGlobalKeywords = baseRuleSet.globalKeywords;
      }

      if (Object.hasOwn(baseRuleSet[targetUrl], "keywords")) {
        targetKeywords = baseRuleSet[targetUrl].keywords;
      }

      if (Object.hasOwn(baseRuleSet[targetUrl], "elementContainers")) {
        targetContainers = baseRuleSet[targetUrl].elementContainers;
      }

      if (Object.hasOwn(baseRuleSet[targetUrl], "excludes")) {
        if (baseRuleSet[targetUrl].excludes.length !== 0) {
          targetExcludes = baseRuleSet[targetUrl].excludes;
          targetHasExcludes = true;
        }
      }

      if (
        Object.hasOwn(baseRuleSet[targetUrl], "removeElement") &&
        baseRuleSet[targetUrl].removeElement
      ) {
        targetRemove = true;
      }

      if (doDebug) {
        outputConsole(
          "[webViper] [ DEBUG ] global keywords    : ",
          targetGlobalKeywords,
        );
        outputConsole("[webViper] [ DEBUG ] rule               : ", targetUrl);
        outputConsole(
          "[webViper] [ DEBUG ] keywords           : ",
          targetKeywords,
        );
        outputConsole(
          "[webViper] [ DEBUG ] elementContainers  : ",
          targetContainers,
        );
        outputConsole(
          "[webViper] [ DEBUG ] excludes           : ",
          targetExcludes,
        );
      }

      createKeywordsRemovalDict(removedByKeywords, targetGlobalKeywords);
      createKeywordsRemovalDict(removedByKeywords, targetKeywords);

      doParse(
        removedByKeywords,
        targetContainers,
        targetExcludes,
        targetHasExcludes,
        targetRemove,
      );
      break;
    }
  }

  let vipedByViper = 0;
  for (const key of Object.keys(removedByKeywords)) {
    const amount = removedByKeywords[key];
    if (amount > 0) {
      outputConsole(
        "[webViper] Removed for keyword  : " + key + " ----> " + amount,
      );
      vipedByViper += amount;
    }
  }

  outputConsole(
    "[webViper] [ RUN ] Run end." +
      (vipedByViper !== 0
        ? " Viped items: " + vipedByViper
        : " No viped items."),
  );

  if (doDebug) {
    outputConsole(
      "[webViper] [ DEBUG END ] -------------------------------------",
    );
  }
}

let hasChange = true;
let vipeStarted = false;
let pageloadCheckTimer = null;

function resetLoad() {
  if (!hasChange) {
    vipeStarted = true;
    clearInterval(pageloadCheckTimer);
    doVipe();
    return;
  }

  hasChange = false;
}

function checkLoad() {
  if (vipeStarted) {
    return;
  }

  hasChange = true;
  if (pageloadCheckTimer) {
    return;
  }

  pageloadCheckTimer = setInterval(resetLoad, 2000);
}

function initObserver() {
  for (const url of Object.keys(baseRuleSet)) {
    if (currentPageLocation.indexOf(url) > -1) {
      outputConsole(
        "[webViper] [ RUN ] Rule found, starting observer for: " + url,
      );

      const observer = new window.MutationObserver(checkLoad);
      const observerConfig = {
        subtree: true,
        childList: true,
      };

      // Lets get the party started!
      observer.observe(document.body, observerConfig);
      break;
    }
  }
}

window.requestAnimationFrame(initObserver);
window.requestAnimationFrame(checkLoad);
