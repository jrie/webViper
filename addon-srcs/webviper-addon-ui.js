// --------------------------------------------------------------------------------------------------------------------------
//
// --------------------------------------------------------------------------------------------------------------------------
let doDebug = false;
let globalKeywords = [];
let ruleSet = {};

const baseRuleSet = {
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
    removeElement: false,
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
  }
};
// -----------------------------------------------------------------------------------------
// Globals
// -----------------------------------------------------------------------------------------
const useBrowserBackend = true;
const useChrome = typeof (browser) === 'undefined';

// -----------------------------------------------------------------------------------------
// webviper data pathes in storage
// -----------------------------------------------------------------------------------------
const pathDebug = 'webviper-doDebug';
const pathGlobalKeywords = 'webviper-globalKeywords';
const pathRuleSet = 'webviper-ruleSet';

// -----------------------------------------------------------------------------------------
const cssArrayDelimeter = '||';

// -----------------------------------------------------------------------------------------
// Shorteners
// -----------------------------------------------------------------------------------------
const originalValueStore = 'originalValue';
const modifiedValueStore = 'modifiedValue';
const originalKeyStore = 'originalKey';
const modifiedKeyStore = 'modifiedKey';
// -----------------------------------------------------------------------------------------
// Load settings function
// -----------------------------------------------------------------------------------------
async function loadSettings () {
  let doDebugStoreValue;
  let globalKeywordsStoreValue;
  let ruleSetStoreValue;

  if (useBrowserBackend) {
    if (!useChrome) {
      doDebugStoreValue = await browser.storage.local.get(pathDebug);
      globalKeywordsStoreValue = await browser.storage.local.get(pathGlobalKeywords);
      ruleSetStoreValue = await browser.storage.local.get(pathRuleSet);
    } else {
      doDebugStoreValue = await chrome.storage.local.get(pathDebug);
      globalKeywordsStoreValue = await chrome.storage.local.get(pathGlobalKeywords);
      ruleSetStoreValue = await chrome.storage.local.get(pathRuleSet);
    }
  }

  // ---------------------------------------------------------------------------------
  let doDebugValue = doDebug;

  // ---------------------------------------------------------------------------------
  if (doDebugStoreValue && doDebugStoreValue[pathDebug]) {
    doDebugValue = doDebugStoreValue[pathDebug];
  }

  doDebug = doDebugValue === true;

  // ---------------------------------------------------------------------------------
  if (globalKeywordsStoreValue && Object.hasOwn(globalKeywordsStoreValue, pathGlobalKeywords)) {
    globalKeywords = globalKeywords.concat(globalKeywordsStoreValue[pathGlobalKeywords]);
  }

  // ---------------------------------------------------------------------------------
  // Merge base ruleset with user definitions
  ruleSet = baseRuleSet;
  if (ruleSetStoreValue && Object.hasOwn(ruleSetStoreValue, pathRuleSet)) {
    const rule = ruleSetStoreValue[pathRuleSet];
    for (const url of Object.keys(rule)) {
      const merged = Object.assign({}, baseRuleSet[url], rule[url]);
      ruleSet[url] = merged;
    }
  }

  // ---------------------------------------------------------------------------------
  controlUrlRuleList.appendChild(createSelectOption('', 'No selection', true, false));
  for (const key of Object.keys(ruleSet)) {
    controlUrlRuleList.appendChild(createSelectOption(key, key, false, false));
  }

  // ---------------------------------------------------------------------------------

  if (doDebug) {
    console.debug('[webViper] [ INIT ] Do debug is set to ' + doDebug);
    console.debug('[webViper] [ INIT ] Ruleset: ', ruleSet);
  }
}

// -----------------------------------------------------------------------------------------
// Save settings routines
// -----------------------------------------------------------------------------------------
async function saveSetting (settingName, value) {
  let hasError = true;

  if (useBrowserBackend) {
    if (!useChrome) {
      hasError = await browser.storage.local.set({ [settingName]: value });
    } else {
      hasError = await chrome.storage.local.set({ [settingName]: value });
    }
  }

  if (!hasError) {
    console.debug(`[webViper] [ SAVE ] [ SUCCESS ] Saved setting  '${settingName}' with value ==> ${value}`);
    return true;
  }

  console.debug(`[webViper] [ SAVE ] [ ERROR ] Could not save setting  '${settingName}' with value ==> ${value}`);
  return false;
}

// -----------------------------------------------------------------------------------------
// Main javascript for UI
// -----------------------------------------------------------------------------------------
// Navigation elements
// ---------------------------------------------------
const navURL = document.querySelector('#navigation a[href="#url"]');
const navKeywords = document.querySelector('#navigation a[href="#keywords"]');
const navExcludes = document.querySelector('#navigation a[href="#excludes"]');
const navElementContainers = document.querySelector('#navigation a[href="#elementContainers"]');
const navReplaceElements = document.querySelector('#navigation a[href="#replaceElements"]');
const navGlobalKeywords = document.querySelector('#navigation a[href="#globalKeywords"]');
const navSettings = document.querySelector('#navigation a[href="#settings"]');

// -----------------------------------------------------------------------------------------
// URL fields
// ---------------------------------------------------
const controlSearchRules = document.getElementById('searchRules');
const controlClearSearchRule = document.getElementById('clearSearchRule');
const controlSearchDeleteRule = document.getElementById('searchDeleteRule');
const controlUrlRuleList = document.getElementById('urlRuleList');
const ruleHitList = document.getElementById('ruleHits');
const controlNewURLRuleAction = document.getElementById('newURLRuleAction');
// ---------------------------------------------------
// Keywords fields
// ---------------------------------------------------
const controlKeywords = document.getElementById('keywords');
// ---------------------------------------------------
// Exclude fields
// ---------------------------------------------------
const controlExcludes = document.getElementById('excludes');
// ---------------------------------------------------
// Element container fields
// ---------------------------------------------------
const controlRuleSelector = document.getElementById('ruleSelector');
const controlSelectorParents = document.getElementById('selectorParents');
const controlAddSelector = document.getElementById('addSelector');
// const controlUpdateSelector = document.getElementById('updateSelector');
const controlClearSelector = document.getElementById('clearSelector');
const controlElementContainers = document.getElementById('elementContainers');
const controlRemoveSelectorRule = document.getElementById('removeSelectorRule');
// const controlClearSelectorRule = document.getElementById('clearSelectorRule');

// ---------------------------------------------------
// ReplaceElement fields
// ---------------------------------------------------
const controlReplaceElements = document.getElementById('replaceElements');

// ---------------------------------------------------
// Global keywords fields
// ---------------------------------------------------
const controlGlobalKeywords = document.getElementById('globalKeywords');
const controlSaveGlobalKeywords = document.getElementById('saveGlobalKeywords');

// ---------------------------------------------------
// Settings fields
// ---------------------------------------------------
const controlDebug = document.getElementById('debug');
const controlSaveSettings = document.getElementById('saveSettings');

// ---------------------------------------------------
// Overall save button
// ---------------------------------------------------
const controlSaveAll = document.getElementById('saveAll');
controlSaveAll.addEventListener('click', function (evt) {
  const newCreatedRuleDictionary = {};
  const targetURL = controlSearchRules.value.trim();
  const keywords = controlKeywords.value.trim().split('\n');
  const excludes = controlExcludes.value.trim().split('\n');
  const replaceElements = controlReplaceElements.value === 'true';

  const resultKeywords = [];
  for (let item of keywords) {
    item = item.trim();

    if (item.length === 0) {
      continue;
    }

    if (resultKeywords.indexOf(item) === -1) {
      resultKeywords.push(item);
    }
  }

  controlKeywords.value = resultKeywords.join('\n');

  const resultExcludes = [];
  for (let item of excludes) {
    item = item.trim();

    if (item.length === 0) {
      continue;
    }
    if (resultExcludes.indexOf(item) === -1) {
      resultExcludes.push(item);
    }
  }

  controlExcludes.value = resultExcludes.join('\n');

  newCreatedRuleDictionary[targetURL] = {};
  newCreatedRuleDictionary[targetURL].keywords = resultKeywords;
  newCreatedRuleDictionary[targetURL].excludes = resultExcludes;

  const elementContainersRules = {};
  const elementContainersOptions = controlElementContainers.options;
  for (const option of elementContainersOptions) {
    if (hasDisabled(option)) {
      continue;
    }

    const isRemoved = getDatasetValue(option, 'removed') === 'true';
    if (isRemoved) {
      continue;
    }

    const isAdded = getDatasetValue(option, 'added') === 'true';
    const modifiedValue = getDatasetValue(option, modifiedValueStore);
    const modifiedKey = getDatasetValue(option, modifiedKeyStore);

    if (isAdded) {
      elementContainersRules[modifiedKey] = modifiedValue.trim().split(cssArrayDelimeter);
    } else {
      elementContainersRules[modifiedKey] = modifiedValue.trim().split(cssArrayDelimeter);
    }
  }

  newCreatedRuleDictionary[targetURL].elementContainers = elementContainersRules;
  newCreatedRuleDictionary[targetURL].replaceElements = replaceElements;

  if (!hasDisabled(controlSaveGlobalKeywords)) {
    window.alert('You have unsaved \'Global Keywords\' changes.');
    setActiveLinkAndScroll('globalKeywords-section');
    return;
  }

  if (!hasDisabled(controlSaveSettings)) {
    window.alert('You have unsaved \'Settings\' changes.');
    setActiveLinkAndScroll('settings-section');
    return;
  }

  ruleSet[targetURL] = newCreatedRuleDictionary[targetURL];
  saveSetting(pathRuleSet, ruleSet);
  setDisableState(evt.target, true);
  window.alert('Saved all settings');
  clearRuleValues();
  clearSearchRule();
  setActiveLinkAndScroll('url-section');
});

// ---------------------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------------------
let currentActiveSectionId;
const navigationLinks = document.querySelectorAll('#navigation a');
const actionsForm = document.getElementById('actions');
const actionItems = document.querySelectorAll('.actionItem');

function setActiveLinkAndScroll (targetId) {
  const target = document.getElementById(targetId);
  currentActiveSectionId = target.id;

  actionItems.forEach((item) => {
    item.style.opacity = '0';
  });

  actionsForm.scrollLeft = target.offsetLeft - actionsForm.offsetLeft;
  target.style.opacity = '1';

  navigationLinks.forEach((navLink) => {
    removeClass(navLink, 'active');
  });

  const activeNavItem = document.querySelector(`#navigation a[href="#${targetId.replace('-section', '')}"]`);
  addClass(activeNavItem, 'active');
  activeNavItem.click();
}

// ---------------------------------------------------------------------------------------
// Main UI init function
// ---------------------------------------------------------------------------------------
function initUI () {
  // ---------------------------------------------------------------------------------------
  // Populate global UI values
  // ---------------------------------------------------------------------------------------
  if (globalKeywords.length !== 0) {
    controlGlobalKeywords.value = globalKeywords.join('\n').trim();
    setDataValue(controlGlobalKeywords, originalValueStore, controlGlobalKeywords.value);
  } else {
    controlGlobalKeywords.value = '';
    setDataValue(controlGlobalKeywords, originalValueStore, '');
  }

  controlDebug.value = doDebug ? 'true' : 'false';
  setDataValue(controlDebug, originalValueStore, controlDebug.value);

  // ---------------------------------------------------------------------------------------
  // Setup navigation
  // ---------------------------------------------------------------------------------------
  // ---------------------------------------------------------------------------------------
  const controls = document.querySelectorAll('.actionItem input, .actionItem textarea, .actionItem select, .actionItem button');
  let directionIsForward = false;

  const excludoriginalValueStore = ['searchRules'];
  controls.forEach(item => {
    if (item.nodeName !== 'BUTTON') {
      if (excludoriginalValueStore.indexOf(item.id) === -1) {
        setDataValue(item, originalValueStore, item.value);
      }

      item.addEventListener('keydown', function (evt) {
        if (evt.key === 'Tab') {
          if (evt.shiftKey) {
            directionIsForward = false;
          } else {
            directionIsForward = true;
          }
        }
      }, true);
    }

    item.addEventListener('focus', function (evt) {
      const parent = evt.target.closest('div.actionItem');

      if (parent.id !== currentActiveSectionId) {
        evt.stopPropagation();
        evt.preventDefault();

        const srcId = parent.id.substring(0, parent.id.indexOf('-'));
        const navTarget = document.querySelector(`#navigation a[href="#${srcId}"]`);
        if (!isNavItemDisabled(navTarget)) {
          setActiveLinkAndScroll(parent.id);
        } else {
          if (directionIsForward) {
            let nextNavNode = navTarget.parentNode;
            while (nextNavNode) {
              if (nextNavNode.nodeName === 'LI' && !hasClass(nextNavNode, 'disabled')) {
                nextNavNode.children[0].click();
                break;
              }

              nextNavNode = nextNavNode.nextElementSibling;
            }
          } else {
            let nextNavNode = navTarget.parentNode;
            while (nextNavNode) {
              if (nextNavNode.nodeName === 'LI' && !hasClass(nextNavNode, 'disabled')) {
                nextNavNode.children[0].click();
                break;
              }

              nextNavNode = nextNavNode.previousElementSibling;
            }
          }
        }
      }
    }, true);
  });

  // ---------------------------------------------------------------------------------------
  let focusTimeOut;
  navigationLinks.forEach((link) => {
    link.setAttribute('tabIndex', '-1');

    link.addEventListener('click', (evt) => {
      evt.preventDefault();

      if (hasClass(link.parentNode, 'disabled')) {
        return;
      }

      const targetId = link.getAttribute('href').substring(1) + '-section';
      setActiveLinkAndScroll(targetId);

      const target = document.getElementById(targetId);
      const controlsInView = target.querySelectorAll('input, textarea, select');
      if (controlsInView.length !== 0 && !focusTimeOut) {
        focusTimeOut = true;
        window.setTimeout(function () {
          controlsInView[0].focus();
          focusTimeOut = false;
        }, 330);
      }
    });
  });

  // ---------------------------------------------------------------------------------------
  enabledNavItem(navURL);
  disableNavItem(navKeywords);
  disableNavItem(navExcludes);
  disableNavItem(navElementContainers);
  disableNavItem(navReplaceElements);

  setDisableState(controlSaveAll, true);

  // ---------------------------------------------------------------------------------------
  // Populate UI functionality
  // ---------------------------------------------------------------------------------------
  controlSearchRules.addEventListener('keyup', searchRules);
  controlClearSearchRule.addEventListener('click', clearSearchRule);
  controlSearchDeleteRule.addEventListener('click', deleteRule);
  controlUrlRuleList.addEventListener('change', fillRuleBySearchSelection);

  // ---------------------------------------------------------------------------------------
  controlKeywords.addEventListener('keyup', hasFormDataChanged);

  // ---------------------------------------------------------------------------------------
  controlExcludes.addEventListener('keyup', hasFormDataChanged);

  // ---------------------------------------------------------------------------------------
  controlRuleSelector.addEventListener('focus', function (evt) {
    evt.preventDefault();
  }, true);

  controlRuleSelector.addEventListener('keyup', function (evt) {
    // controlUpdateSelector.textContent = 'Update';

    let hasOption = false;
    for (const option of controlElementContainers.options) {
      if (hasDisabled(option)) {
        continue;
      }

      if (evt.target.value === option.dataset[originalKeyStore]) {
        hasOption = true;
        controlElementContainers.selectedIndex = option.index;
        setDataValue(option, modifiedKeyStore, evt.target.value);

        if (evt.key === 'Enter') {
          controlElementContainers.dispatchEvent(new Event('change'));
        }

        break;
      }
    }

    if (!hasOption) {
      // controlSelectorParents.value = '';
      controlElementContainers.selectedIndex = 0;
      setDisableState(controlRemoveSelectorRule, true);
      setAddButtonToRestore(false);
    } else if (controlSelectorParents.value === '') {
      controlElementContainers.dispatchEvent(new Event('change'));
      setDisableState(controlRemoveSelectorRule, false);
    }

    hasFormDataChanged();
  });

  controlElementContainers.addEventListener('change', function (evt) {
    if (evt.target.options.selectedIndex !== 0) {
      const option = evt.target.options[evt.target.options.selectedIndex];

      controlRuleSelector.value = getDatasetValue(option, modifiedKeyStore);
      setDataValue(controlRuleSelector, modifiedKeyStore, controlRuleSelector.value);

      controlSelectorParents.value = getDatasetValue(option, modifiedValueStore).split(cssArrayDelimeter).join('\n');
      setDisableState(controlRemoveSelectorRule, false);

      const isRemoved = getDatasetValue(option, 'removed') === 'true';

      if (isRemoved) {
        controlRemoveSelectorRule.textContent = 'Readd';
      } else {
        controlRemoveSelectorRule.textContent = 'Remove';
      }
    }

    hasFormDataChanged();
  });

  controlSelectorParents.addEventListener('focus', function (evt) {
    controlElementContainers.dispatchEvent(new Event('change'));
  });

  controlSelectorParents.addEventListener('keyup', function (evt) {
    if (controlElementContainers.options.selectedIndex !== 0) {
      const option = controlElementContainers.options[controlElementContainers.options.selectedIndex];

      const originalValue = getDatasetValue(option, originalValueStore);
      const compareValue = evt.target.value.trim().split('\n').join(cssArrayDelimeter);
      const modifiedKey = getDatasetValue(option, modifiedKeyStore);
      const isOriginal = isEqual(originalValue, compareValue);

      const isRemoved = getDatasetValue(option, 'removed') === 'true';
      if (!isOriginal) {
        if (getDatasetValue(option, 'added') === 'true') {
          option.text = modifiedKey + ' (added on save)';
        } else {
          option.text = modifiedKey + ' (modified)';

          if (isRemoved) {
            controlRemoveSelectorRule.textContent = 'Remove';
            setDataValue(option, 'removed', false);
          }
        }

        setDataValue(option, modifiedValueStore, compareValue);
      } else {
        if (getDatasetValue(option, 'added') === 'true') {
          option.text = modifiedKey + ' (added on save)';
        } else {
          if (isRemoved) {
            option.text = modifiedKey + ' (removed on save)';
          } else {
            option.text = modifiedKey;
          }
        }
        setDataValue(option, modifiedValueStore, originalValue);
      }
    }

    hasFormDataChanged();
  });

  // ---------------------------------------------------------------------------------------
  setAddButtonToRestore(false);

  controlAddSelector.addEventListener('click', function (evt) {
    if (controlAddSelector.dataset.restore === 'false') {
      const selectorKey = controlRuleSelector.value.trim();

      let hasOption = false;

      for (const option of controlElementContainers.options) {
        if (hasDisabled(option)) {
          continue;
        }

        if (option.text === selectorKey) {
          hasOption = true;
          break;
        }
      }

      if (!hasOption) {
        const selectorValues = controlSelectorParents.value.trim().split('\n').join(cssArrayDelimeter);
        const selectorOption = createSelectOption(selectorValues, selectorKey, false, false);
        selectorOption.text += ' (added on save)';

        setDataValue(selectorOption, 'added', true);
        setDataValue(selectorOption, 'removed', false);
        setDataValue(selectorOption, originalKeyStore, selectorKey);
        setDataValue(selectorOption, modifiedKeyStore, selectorKey);
        setDataValue(selectorOption, originalValueStore, selectorValues);
        setDataValue(selectorOption, modifiedValueStore, selectorValues);

        controlElementContainers.appendChild(selectorOption);
        controlElementContainers.selectedIndex = selectorOption.index;
        setDisableState(controlRemoveSelectorRule, false);
      }
    }

    if (controlElementContainers.options.selectedIndex !== 0) {
      const option = controlElementContainers.options[controlElementContainers.options.selectedIndex];

      if (controlAddSelector.dataset.restore === 'true') {
        const originalValue = getDatasetValue(option, originalValueStore);
        const compareValue = option.value.trim().split('\n').join(cssArrayDelimeter);
        const modifiedKey = getDatasetValue(option, modifiedKeyStore);
        const isOriginal = isEqual(originalValue, compareValue);

        if (!isOriginal) {
          if (getDatasetValue(option, 'added') === 'true') {
            option.text = modifiedKey + ' (added on save)';
            setDataValue(option, originalValueStore, compareValue);
            controlSelectorParents.value = compareValue.split(cssArrayDelimeter).join('\n');
            setDisableState(controlAddSelector, false);
          } else {
            option.text = modifiedKey + ' (modified)';
          }

          setDataValue(option, modifiedValueStore, compareValue);
        } else {
          if (getDatasetValue(option, 'added') === 'true') {
            option.text = modifiedKey + ' (added on save)';
            setDataValue(option, originalValueStore, compareValue);
          } else {
            option.text = modifiedKey;
          }
          setDataValue(option, modifiedValueStore, originalValue);
          controlSelectorParents.value = originalValue.split(cssArrayDelimeter).join('\n');
        }

        setAddButtonToRestore(false);
      }
    }

    hasFormDataChanged();
  });

  controlRemoveSelectorRule.addEventListener('click', function (evt) {
    if (controlElementContainers.options.selectedIndex !== 0) {
      const option = controlElementContainers.options[controlElementContainers.options.selectedIndex];

      if (getDatasetValue(option, 'added') === 'true') {
        controlElementContainers.removeChild(option);
        controlElementContainers.options.selectedIndex = 0;
        setAddButtonToRestore(false);
      } else {
        const originalValue = getDatasetValue(option, originalValueStore);
        const modifiedValue = getDatasetValue(option, modifiedValueStore);
        const modifiedKey = getDatasetValue(option, modifiedKeyStore);
        const isOriginal = isEqual(originalValue, modifiedValue);

        const isRemoved = getDatasetValue(option, 'removed') === 'true';

        if (!isRemoved) {
          option.text = modifiedKey + ' (removed on save)';
          setDataValue(option, 'removed', true);
          controlRemoveSelectorRule.textContent = 'Readd';
          controlRuleSelector.value = '';
          controlSelectorParents.value = '';
        } else {
          if (isOriginal) {
            option.text = modifiedKey;
          } else {
            option.text = modifiedKey + ' (modified)';
          }
          setDataValue(option, 'removed', false);
          controlRemoveSelectorRule.textContent = 'Remove';
          controlRuleSelector.value = modifiedKey;
          controlSelectorParents.value = modifiedValue.split(cssArrayDelimeter).join('\n');
        }
      }

      hasFormDataChanged();
    }
  });

  /*
  controlUpdateSelector.addEventListener('click', function (evt) {
    if (controlElementContainers.options.selectedIndex !== 0) {
      const option = controlElementContainers.options[controlElementContainers.options.selectedIndex];
    }
  });
  */

  // ---------------------------------------------------------------------------------------
  controlClearSelector.addEventListener('click', function (evt) {
    if (controlElementContainers.options.selectedIndex !== 0) {
      const option = controlElementContainers.options[controlElementContainers.options.selectedIndex];
      const modifiedValue = getDatasetValue(option, modifiedValueStore);
      const compareValue = option.value.trim().split('\n').join(cssArrayDelimeter);
      const isOriginal = isEqual(modifiedValue, compareValue);
      if (isOriginal) {
        controlSelectorParents.value = '';
        controlRuleSelector.value = '';
        setDisableState(controlClearSelector, true);

        const isAdded = getDatasetValue(option, 'added') === 'true';
        const isRemoved = getDatasetValue(option, 'removed') === 'true';
        if (!isAdded && !isRemoved) {
          controlElementContainers.options.selectedIndex = 0;
          setDisableState(controlRemoveSelectorRule, true);
        }
      } else {
        controlSelectorParents.value = modifiedValue.split(cssArrayDelimeter).join('\n');
        setDisableState(controlClearSelector, false);
      }
    } else {
      controlSelectorParents.value = '';
      controlRuleSelector.value = '';
      setDisableState(controlClearSelector, true);
    }

    hasFormDataChanged();
  });

  // ---------------------------------------------------------------------------------------
  controlReplaceElements.addEventListener('change', function (evt) {
    hasFormDataChanged();
  });

  // ---------------------------------------------------------------------------------------
  controlGlobalKeywords.addEventListener('keyup', function (evt) {
    setDisableState(controlSaveGlobalKeywords, isEqual(evt.target.value, getDatasetValue(evt.target, originalValueStore)));
  });

  controlSaveGlobalKeywords.addEventListener('click', function (evt) {
    const keywords = controlGlobalKeywords.value.trim().split('\n');

    const resultKeywords = [];
    for (let item of keywords) {
      item = item.trim();
      if (resultKeywords.indexOf(item) === -1) {
        resultKeywords.push(item);
      }
    }

    if (saveSetting(pathGlobalKeywords, resultKeywords)) {
      setDataValue(controlGlobalKeywords, originalValueStore, resultKeywords);
      setDisableState(controlSaveGlobalKeywords, true);
      controlGlobalKeywords.value = resultKeywords.join('\n');
    }
  });

  // ---------------------------------------------------------------------------------------
  controlDebug.addEventListener('change', function (evt) {
    setDisableState(controlSaveSettings, isEqual(evt.target.value, getDatasetValue(evt.target, originalValueStore)));
  });

  controlSaveSettings.addEventListener('click', function (evt) {
    const value = controlDebug.value === 'true';

    if (saveSetting(pathDebug, value)) {
      setDataValue(controlDebug, originalValueStore, value);
      setDisableState(controlSaveSettings, true);
    }
  });

  // ---------------------------------------------------------------------------------------
  // Set active initital tab
  // ---------------------------------------------------------------------------------------
  setActiveLinkAndScroll('url-section');

  // ---------------------------------------------------------------------------------------
  // Signal we are finished, for debugging only
  // ---------------------------------------------------------------------------------------
  console.debug('webViper UI initialized...');
}

// ---------------------------------------------------------------------------------------
// Main UI functionality
// ---------------------------------------------------------------------------------------
// Navigation helper
// ---------------------------------------------------------------------------------------
function disableNavItem (target) {
  target.parentNode.classList.add('disabled');
  target.setAttribute('disabled', 'disabled');
  target.setAttribute('tabIndex', -1);
}

function enabledNavItem (target) {
  target.parentNode.classList.remove('disabled');
  target.removeAttribute('disabled');
  target.removeAttribute('tabIndex');
}

function isNavItemDisabled (target) {
  return target.parentNode.classList.contains('disabled');
}

// ---------------------------------------------------------------------------------------
function hasDisabled (target) {
  return target.hasAttribute('disabled');
}
// ---------------------------------------------------------------------------------------
function isEqual (valueOne, valueTwo) {
  return valueOne === valueTwo;
}

// ---------------------------------------------------------------------------------------
function setDataValue (target, name, value) {
  target.dataset[name] = value;
}

function getDatasetValue (target, name) {
  return target.dataset[name];
}

// ---------------------------------------------------------------------------------------
function hasClass (target, className) {
  return target.classList.contains(className);
}

function addClass (target, className) {
  target.classList.add(className);
}

function removeClass (target, className) {
  target.classList.remove(className);
}

// ---------------------------------------------------------------------------------------
function setDisableState (target, doDisable) {
  doDisable ? target.setAttribute('disabled', 'disabled') : target.removeAttribute('disabled');
}

// ---------------------------------------------------------------------------------------
function setExpanderValue (target, value) {
  const expander = target.parentNode.classList.contains('expand-input') ? target.parentNode : false;

  if (expander) {
    setDataValue(expander, 'value', value);
  }
}

function clearExpanderValue (target) {
  const expander = target.parentNode.classList.contains('expand-input') ? target.parentNode : false;

  if (expander) {
    setDataValue(expander, 'value', '');
  }
}

// ---------------------------------------------------------------------------------------
function createSelectOption (value, text, isSelected, isDisabled) {
  const option = document.createElement('option');

  option.value = value;
  option.appendChild(document.createTextNode(text));

  if (isSelected) {
    option.setAttribute('selected', 'selected');
  }

  if (isDisabled) {
    setDisableState(option, true);
  }

  return option;
}

// ---------------------------------------------------------------------------------------
function searchRules (evt) {
  const searchValue = evt.target.value.trim().toLocaleLowerCase();
  clearExpanderValue(evt.target);

  if (searchValue.length < 2) {
    ruleHitList.style.visibility = 'hidden';
    ruleHitList.replaceChildren();

    controlUrlRuleList.value = '';
    controlNewURLRuleAction.value = getDatasetValue(controlNewURLRuleAction, originalValueStore);
    setDisableState(controlSearchDeleteRule, true);

    disableNavItem(navKeywords);
    disableNavItem(navExcludes);
    disableNavItem(navElementContainers);
    disableNavItem(navReplaceElements);
    return;
  }

  let hits = 0;
  const ruleHits = [];
  let hasExactHit = false;

  for (const ruleKey of Object.keys(ruleSet)) {
    const keyLower = ruleKey.toLocaleLowerCase();

    if (keyLower.startsWith(searchValue)) {
      setExpanderValue(evt.target, ruleKey);
      hasExactHit = true;

      ++hits;

      ruleHits.push(ruleKey);

      if (hits === 3) {
        break;
      }

      continue;
    }

    if (keyLower.indexOf(searchValue) > -1) {
      ++hits;

      ruleHits.push(ruleKey);

      if (hits === 3) {
        break;
      }
    }
  }

  ruleHitList.style.visibility = 'hidden';

  if (evt.key === 'Enter') {
    if (hits === 0 || !hasExactHit) {
      clearRuleValues();
      // clearSearchRule();

      ruleHitList.replaceChildren();
      setDisableState(controlClearSearchRule, false);
      setDisableState(controlSearchDeleteRule, true);
      controlNewURLRuleAction.value = `Adding a new rule for: ${searchValue}`;
      controlUrlRuleList.value = '';
    } else if (hasExactHit) {
      clearExpanderValue(evt.target);

      ruleHitList.style.visibility = 'hidden';
      if (ruleHitList.children[0]) {
        ruleHitList.children[0].click();
      }

      ruleHitList.replaceChildren();
    }

    enabledNavItem(navKeywords);
    enabledNavItem(navExcludes);
    enabledNavItem(navElementContainers);
    enabledNavItem(navReplaceElements);
    return;
  } else if (hits === 0 && !hasExactHit) {
    setDisableState(controlSearchDeleteRule, true);
  }

  if (hits !== 0) {
    ruleHitList.replaceChildren();
    ruleHits.forEach(hit => {
      const hitItem = document.createElement('li');
      hitItem.addEventListener('click', setRuleFromSearch);
      hitItem.appendChild(document.createTextNode(hit));
      ruleHitList.appendChild(hitItem);
    });

    if (hasExactHit) {
      if (evt.key === 'Backspace' || evt.key === 'Delete') {
        clearExpanderValue(evt.target);
        clearRuleValues();
        disableNavItem(navKeywords);
        disableNavItem(navExcludes);
        disableNavItem(navElementContainers);
        disableNavItem(navReplaceElements);
      }

      setExpanderValue(evt.target, ruleHits[0]);
    }

    ruleHitList.style.visibility = 'visible';
  }
}

// ---------------------------------------------------------------------------------------
function fillRuleBySearchSelection (evt) {
  if (!evt.target.value) {
    clearSearchRule();
    return;
  }

  const domainName = evt.target.options[evt.target.selectedIndex].value;

  controlSearchRules.value = domainName;
  controlUrlRuleList.value = controlSearchRules.value;
  controlNewURLRuleAction.value = `Edit rule: ${controlSearchRules.value}`;
  setDisableState(controlSearchDeleteRule, false);
  setDisableState(controlClearSearchRule, false);

  enabledNavItem(navKeywords);
  enabledNavItem(navExcludes);
  enabledNavItem(navElementContainers);
  enabledNavItem(navReplaceElements);

  clearExpanderValue(controlSearchRules);

  clearRuleValues();
  setRuleValues(domainName);
}

// ---------------------------------------------------------------------------------------
function setRuleFromSearch (evt) {
  controlSearchRules.value = evt.target.textContent.trim();

  ruleHitList.style.visibility = 'hidden';
  controlUrlRuleList.value = controlSearchRules.value;
  controlNewURLRuleAction.value = `Edit rule: ${controlSearchRules.value}`;
  setDisableState(controlSearchDeleteRule, false);
  setDisableState(controlClearSearchRule, false);

  enabledNavItem(navKeywords);
  enabledNavItem(navExcludes);
  enabledNavItem(navElementContainers);
  enabledNavItem(navReplaceElements);

  clearExpanderValue(controlSearchRules);

  clearRuleValues();
  setRuleValues(evt.target.textContent);
}

// ---------------------------------------------------------------------------------------
function deleteRule (evt) {
  const ruleValue = controlSearchRules.value.trim();
  if (window.confirm('Do you want to remove the rule for \'' + ruleValue + '\'')) {
    clearRuleValues();
    clearSearchRule();

    delete ruleSet[ruleValue];

    // ---------------------------------------------------------------------------------
    for (const option of controlUrlRuleList.options) {
      if (option.value === ruleValue) {
        controlUrlRuleList.removeChild(option);
        break;
      }
    }

    saveSetting(pathRuleSet, ruleSet);
    window.alert('Rule \'' + ruleValue + '\' succesfully removed.');
  }
}

// ---------------------------------------------------------------------------------------
function clearSearchRule () {
  controlUrlRuleList.value = '';
  controlSearchRules.value = '';
  ruleHitList.style.visibility = 'hidden';

  setDisableState(controlSearchDeleteRule, true);
  setDisableState(controlClearSearchRule, true);

  controlNewURLRuleAction.value = getDatasetValue(controlNewURLRuleAction, originalValueStore);

  disableNavItem(navKeywords);
  disableNavItem(navExcludes);
  disableNavItem(navElementContainers);
  disableNavItem(navReplaceElements);

  clearExpanderValue(controlSearchRules);
  clearRuleValues();
}

// ---------------------------------------------------------------------------------------
function setAddButtonToRestore (setRestore) {
  if (setRestore) {
    controlAddSelector.textContent = 'Restore';
    controlAddSelector.dataset.restore = 'true';
  } else {
    controlAddSelector.textContent = 'Add';
    controlAddSelector.dataset.restore = 'false';
  }
}
// ---------------------------------------------------------------------------------------
function hasFormDataChanged () {
  const dataHolders = document.querySelectorAll('.actionItem input, .actionItem textarea, .actionItem select');

  const excludes = [
    'newURLRuleAction',
    'globalKeywords',
    'debug',
    'searchRules',
    'selectorParents'
  ];

  const keyStoreFields = [
    controlRuleSelector.id
  ];

  let isDirty = false;
  for (const item of dataHolders) {
    if (excludes.indexOf(item.id) !== -1) {
      continue;
    }

    if (item.nodeName === 'SELECT') {
      if (item.options.length !== 0) {
        const option = item.options[item.options.selectedIndex];

        if (hasDisabled(option)) {
          continue;
        }

        let hasDirtyOptions = false;
        let compareTarget;
        let compareValue;
        let buttonsToUpdate;
        let compareStore = originalValueStore;

        if (item.id === 'elementContainers') {
          for (const option of item.options) {
            if (hasDisabled(option)) {
              continue;
            }

            const isAdded = getDatasetValue(option, 'added') === 'true';
            const isRemoved = getDatasetValue(option, 'removed') === 'true';

            if (isAdded || isRemoved || !isEqual(getDatasetValue(option, originalValueStore), getDatasetValue(option, modifiedValueStore))) {
              isDirty = true;
              hasDirtyOptions = true;
              break;
            }
          }

          if (!hasDirtyOptions) {
            compareTarget = option;
            compareStore = modifiedValueStore;
            compareValue = getDatasetValue(option, originalValueStore);
          }

          // buttonsToUpdate = [controlUpdateSelector];
        } else if (item.id === 'replaceElements') {
          compareTarget = item;
          compareValue = item.value;
        } else {
          compareTarget = item;
          compareValue = option.value;
        }

        if (hasDirtyOptions || !isEqual(compareValue, getDatasetValue(compareTarget, compareStore))) {
          isDirty = true;
        }

        if (buttonsToUpdate) {
          buttonsToUpdate.forEach(button => {
            setDisableState(button, !isDirty);
          });
        }
      }

      continue;
    } else if (item.id === 'ruleSelector') {
      if (item.value === '') {
        setDisableState(controlAddSelector, true);
        // setDisableState(controlUpdateSelector, true);
        setDisableState(controlClearSelector, true);
        continue;
      }

      setDisableState(controlAddSelector, true);
      // setDisableState(controlUpdateSelector, true);
      setDisableState(controlClearSelector, false);

      if (controlElementContainers.selectedIndex === 0) {
        setDisableState(controlAddSelector, false);

        if (controlSelectorParents.value !== '') {
          setDisableState(controlClearSelector, false);
        }
      } else if (controlElementContainers.value !== '') {
        let hasDirtyOptions = false;

        for (const option of controlElementContainers.options) {
          if (hasDisabled(option)) {
            continue;
          }

          const isAdded = getDatasetValue(option, 'added') === 'true';

          if (isAdded) {
            hasDirtyOptions = true;
            if (controlElementContainers.selectedIndex === option.index) {
              setAddButtonToRestore(true);

              if (isEqual(getDatasetValue(option, originalValueStore), getDatasetValue(option, modifiedValueStore))) {
                setDisableState(controlAddSelector, true);
              } else {
                setDisableState(controlAddSelector, false);
              }
            }

            break;
          } else if (isEqual(getDatasetValue(option, originalValueStore), getDatasetValue(option, modifiedValueStore))) {
            if (controlElementContainers.selectedIndex === option.index) {
              setDisableState(controlAddSelector, true);
              setAddButtonToRestore(false);
            }

            continue;
          }

          hasDirtyOptions = true;
          if (controlElementContainers.selectedIndex === option.index) {
            // setDisableState(controlUpdateSelector, false);
            setDisableState(controlAddSelector, false);
            setAddButtonToRestore(true);
            break;
          }
        }

        if (hasDirtyOptions) {
          isDirty = true;
          if (controlSelectorParents.value !== '') {
            setDisableState(controlClearSelector, false);
          } else {
            setDisableState(controlClearSelector, true);
            // setDisableState(controlUpdateSelector, true);
          }

          break;
        } else {
          setAddButtonToRestore(false);
          continue;
        }
      } else {
        // setDisableState(controlUpdateSelector, true);
        setDisableState(controlClearSelector, false);
        setAddButtonToRestore(false);
      }

      if (controlElementContainers.selectedIndex === 0) {
        break;
      }
    }

    let dataStore;
    if (keyStoreFields.indexOf(item.id) !== -1) {
      dataStore = modifiedKeyStore;
    } else {
      dataStore = originalValueStore;
    }

    const storeValue = getDatasetValue(item, dataStore);
    if (!isEqual(item.value, storeValue)) {
      isDirty = true;
      break;
    }
  }

  setDisableState(controlSaveAll, !isDirty);
  return isDirty;
}

// ---------------------------------------------------------------------------------------
function clearRuleValues () {
  controlKeywords.value = '';
  setDataValue(controlKeywords, originalValueStore, controlKeywords.value);

  controlExcludes.value = '';
  setDataValue(controlExcludes, originalValueStore, controlExcludes.value);

  controlReplaceElements.value = 'true';

  controlRuleSelector.value = '';
  controlSelectorParents.value = '';
  setDataValue(controlReplaceElements, originalValueStore, controlReplaceElements.value);

  controlElementContainers.replaceChildren();
  controlElementContainers.appendChild(createSelectOption('', 'Select selector rule for edit', true, true));
  setDataValue(controlElementContainers, originalValueStore, controlElementContainers.length);

  setDisableState(controlSaveAll, true);
  hasFormDataChanged();
}

// ---------------------------------------------------------------------------------------
function setRuleValues (ruleKey) {
  if (!Object.hasOwn(ruleSet, ruleKey)) {
    console.debug('[webViper] [ RULES ] Rule for set values is not present: ' + ruleKey);
    return;
  }

  // ---------------------------------------------------------------------------------------
  const rule = ruleSet[ruleKey];

  // ---------------------------------------------------------------------------------------
  if (Object.hasOwn(rule, 'keywords') && rule.keywords.length !== 0) {
    controlKeywords.value = rule.keywords.join('\n').trim();
  } else {
    controlKeywords.value = '';
  }

  setDataValue(controlKeywords, originalValueStore, controlKeywords.value);

  // ---------------------------------------------------------------------------------------
  if (Object.hasOwn(rule, 'excludes') && rule.excludes.length !== 0) {
    controlExcludes.value = rule.excludes.join('\n').trim();
  } else {
    controlExcludes.value = '';
  }

  setDataValue(controlExcludes, originalValueStore, controlExcludes.value);

  // ---------------------------------------------------------------------------------------
  controlElementContainers.replaceChildren();
  controlElementContainers.appendChild(createSelectOption('', 'Select selector rule for edit', true, true));

  if (Object.hasOwn(rule, 'elementContainers') && Object.keys(rule.elementContainers).length !== 0) {
    Object.keys(rule.elementContainers).forEach(selectorKey => {
      const selectorValues = rule.elementContainers[selectorKey].join(cssArrayDelimeter);
      const selectorOption = createSelectOption(selectorValues, selectorKey, false, false);

      setDataValue(selectorOption, 'added', false);
      setDataValue(selectorOption, 'removed', false);
      setDataValue(selectorOption, originalKeyStore, selectorKey);
      setDataValue(selectorOption, modifiedKeyStore, selectorKey);
      setDataValue(selectorOption, originalValueStore, selectorValues);
      setDataValue(selectorOption, modifiedValueStore, selectorValues);

      controlElementContainers.appendChild(selectorOption);
    });
  }

  setDataValue(controlElementContainers, originalValueStore, controlElementContainers.length);

  // ---------------------------------------------------------------------------------------
  if (Object.hasOwn(rule, 'removeElement') && rule.removeElement === true) {
    controlReplaceElements.value = 'true';
  } else {
    controlReplaceElements.value = 'false';
  }

  setDataValue(controlReplaceElements, originalValueStore, controlReplaceElements.value);
}

// -----------------------------------------------------------------------------------------
// Load and init
// -----------------------------------------------------------------------------------------
loadSettings().then(initUI);
