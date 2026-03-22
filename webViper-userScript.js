// ==UserScript==
// @name         webViper
// @version      2026-03-21
// @description  vipe the web, like a pro, using the webViper
// @author       Jan Riechers
// @match        *://*/*
// @grant        none
// @run-at       document-idle
// @website      https://webviper.dwrox.net
// @downloadURL  https://github.com/jrie/webViper
// @supportURL   https://github.com/jrie/webViper/issues
// ==/UserScript==

function scriptWrapper() {
    // -----------------------------------------------------------------------------------
    // Small config
    // -----------------------------------------------------------------------------------
    // This will output some more information to debug console if enabled
    // otherwise only log console statements are used
    const doDebug = false;
    // -----------------------------------------------------------------------------------
    // webpage rules start
    // -----------------------------------------------------------------------------------
    const baseRuleSet = {
        /*
    // Start a rule
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
      // Very much experiemental, in short, clean viped elements:
      // if element in observerContainers: "key" (css selector) change from [ "type", out of "(css) target"]
      //
      // What it does, call a clearing routine and also (re)attach mutation observers to the nodes.
      observerContainers: {
        // c => childList // THIS
        // a => attributes // OR THIS
        // s => subtree // Optional
        ".paginated-products-grid.grid": ["c", "paginated-products-grid"],
      },
    },
    // End of a rule
     */
        globalKeywords: [],
    };
    // -----------------------------------------------------------------------------------
    // webpage rules end - stop editing here
    // -----------------------------------------------------------------------------------

    // -----------------------------------------------------------------------------------
    const currentPageLocation = location.href.toLocaleLowerCase();
    const outputConsole = doDebug ? console.debug : console.log;

    const pageObserver = new window.MutationObserver(checkLoad);
    const pageObserverConfig = {
        //subtree: true,
        //childList: true,
        attributes: true,
    };

    let observerList = [];
    let hasChange = true;
    let pageloadCheckTimer = null;

    // -----------------------------------------------------------------------------------
    function replaceElement(keyword, toReplace) {
        if (toReplace.parentNode) {
            const keyword = 'webViper';
            const replacement = document.createElement(toReplace.nodeName.toLocaleLowerCase());
            replacement.className = toReplace.className + ' vipered';
            replacement.id = toReplace.id;
            replacement.style = toReplace.style;
            replacement.style.textAlign = 'left';
            replacement.style.padding = '1.5vw 1.2vw';
            replacement.style.width = toReplace.clientWidth ? toReplace.clientWidth + 'px' : 'auto';
            replacement.style.height = toReplace.clientHeight ? toReplace.clientHeight + 'px' : 'auto';
            replacement.style.position = 'relative';
            replacement.style.display = 'inherit';

            const wrapperSpan = document.createElement('span');
            wrapperSpan.style = 'color: #666; display: inline-block;';
            wrapperSpan.appendChild(document.createTextNode('This item was viped by'));
            wrapperSpan.appendChild(document.createElement('br'));

            const keywordSpan = document.createElement('span');
            keywordSpan.style = 'color: red; font-weight: bold; font-size: 1.65vw;';
            keywordSpan.appendChild(document.createTextNode(keyword));
            wrapperSpan.appendChild(keywordSpan);

            replacement.appendChild(wrapperSpan);

            toReplace.parentNode.style.position = 'relative';
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
    function doParse(removedByKeywords, targetContainers, targetExcludes, targetHasExcludes, targetRemove) {
        for (const containerKey of Object.keys(targetContainers)) {
            const targets = document.querySelectorAll(containerKey);
            if (targets.length === 0) {
                outputConsole("[webViper] [ RUN ] [ PARSE ] No 'targets' found for selector: '" + containerKey + "'");
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
                                "'"
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
                outputConsole("[webViper] [ RUN ] [ PARSE ] Excluded for '" + containerKey + "' --->" + excludeCount);
            }
        }
    }

    // -----------------------------------------------------------------------------------
    if (doDebug) {
        outputConsole('[webViper] [ DEBUG START ] -----------------------------------');
    }

    let currentPageTarget = '';

    function doVipe() {
        outputConsole('[webViper] [ RUN ] Start.');

        const removedByKeywords = {};
        for (const url of Object.keys(baseRuleSet)) {
            if (currentPageLocation.indexOf(url) > -1) {
                outputConsole('[webViper] [ RUN ] Rule matched for: ' + url);

                const targetUrl = url;
                let targetGlobalKeywords = [];
                let targetKeywords = [];
                let targetContainers = {};
                let targetExcludes = [];
                let targetHasExcludes = false;
                let targetRemove = false;

                if (Object.hasOwn(baseRuleSet, 'globalKeywords')) {
                    targetGlobalKeywords = baseRuleSet.globalKeywords;
                }

                if (Object.hasOwn(baseRuleSet[targetUrl], 'keywords')) {
                    targetKeywords = baseRuleSet[targetUrl].keywords;
                }

                if (Object.hasOwn(baseRuleSet[targetUrl], 'elementContainers')) {
                    targetContainers = baseRuleSet[targetUrl].elementContainers;
                }

                if (Object.hasOwn(baseRuleSet[targetUrl], 'excludes')) {
                    if (baseRuleSet[targetUrl].excludes.length !== 0) {
                        targetExcludes = baseRuleSet[targetUrl].excludes;
                        targetHasExcludes = true;
                    }
                }

                if (Object.hasOwn(baseRuleSet[targetUrl], 'removeElement') && baseRuleSet[targetUrl].removeElement) {
                    targetRemove = true;
                }

                if (doDebug) {
                    outputConsole('[webViper] [ DEBUG ] global keywords    : ', targetGlobalKeywords);
                    outputConsole('[webViper] [ DEBUG ] rule               : ', targetUrl);
                    outputConsole('[webViper] [ DEBUG ] keywords           : ', targetKeywords);
                    outputConsole('[webViper] [ DEBUG ] elementContainers  : ', targetContainers);
                    outputConsole('[webViper] [ DEBUG ] excludes           : ', targetExcludes);
                }

                createKeywordsRemovalDict(removedByKeywords, targetGlobalKeywords);
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

        outputConsole(
            '[webViper] [ RUN ] Run end.' + (vipedByViper !== 0 ? ' Viped items: ' + vipedByViper : ' No viped items.')
        );

        if (doDebug) {
            outputConsole('[webViper] [ DEBUG END ] -------------------------------------');
        }
    }

    let obersersAttached = false;

    function resetLoad() {
        if (!hasChange) {
            clearInterval(pageloadCheckTimer);
            pageloadCheckTimer = null;

            if (obersersAttached) {
                pageObserver.disconnectAll();
            }

            // NOTE: Load attached observers after the page finished loading
            if (!obersersAttached) {
                obersersAttached = true;

                let result = attachObservers(baseRuleSet[currentPageTarget]);
                if (result && result !== false) {
                    outputConsole(
                        '[webViper] [ OBSERVER ] ' + result[0] + ' of ' + result[1] + ' observer(s) found and attached.'
                    );

                    if (doDebug) {
                        outputConsole('[webViper] [ OBSERVER ] List: ', observerList);
                    }
                }
            }

            doVipe();
            pageObserver.takeRecords();
            pageObserver.reconnectAll();
            return;
        }

        hasChange = false;
    }

    function checkLoad() {
        hasChange = true;
    }

    function cleanUpViperedNodes(mutations, srcObserver) {
        let srcNodeKey = srcObserver.getNodeKey();
        let refreshedTarget = getRefreshedNode(srcNodeKey);
        if (refreshedTarget) {
            let nodeList = refreshedTarget.querySelectorAll('.vipered');
            if (doDebug) {
                outputConsole('nodeList', nodeList);
            }

            if (nodeList === null) {
                return;
            }

            // Deactivate observer
            pageObserver.disconnectAll();
            //pageObserver.disconnect();

            for (let node of nodeList) {
                node.parentNode.removeChild(node);
            }

            // Reactivate page observer
            pageObserver.reconnectAll();
            //pageObserver.reconnect();

            hasChange = true;
            clearInterval(pageloadCheckTimer);
            pageloadCheckTimer = null;
            pageloadCheckTimer = setInterval(resetLoad, 1000);
        } else {
            if (doDebug) {
                outputConsole("Node disappeared.. '" + srcNodeKey + "'");
            }
        }
    }

    // Helper function to update a observed note
    function getRefreshedNode(srcNodeKey) {
        if (doDebug) {
            outputConsole('Refreshing node selector..');
        }

        let targetNode = document.querySelector(srcNodeKey);

        if (targetNode !== null) {
            if (doDebug) {
                outputConsole('Found refreshed node.');
            }
            return targetNode;
        }

        if (doDebug) {
            outputConsole('Node not found by new selector..');
        }
        return false;
    }

    function attachObservers(pageRule) {
        let observerDirectives = 0;
        let observersAttached = 0;

        if (Object.hasOwn(pageRule, 'observerContainers')) {
            let observerDict = pageRule['observerContainers'];

            ++observerDirectives;

            for (let key of Object.keys(observerDict)) {
                let valueArray = observerDict[key];
                let srcNode = document.querySelector(key);
                let targetNode = document.querySelector(valueArray[1]);

                if (srcNode === null) {
                    outputConsole(
                        "[webViper] [ OBSERVER ] source node with selector '" +
                            key +
                            "' not present. Please review the selector in the browser inspector."
                    );

                    continue;
                }

                if (targetNode === null) {
                    outputConsole(
                        "[webViper] [ OBSERVER ] target node with selector '" +
                            valueArray[1] +
                            "' not present. Please review the selector in the browser inspector."
                    );

                    continue;
                }

                let observerDirective = {
                    attributes: false,
                    childList: false,
                    subtree: false,
                };

                let configDict = valueArray[0];

                if (typeof configDict === 'string') {
                    if (configDict.indexOf('a') !== -1) {
                        observerDirective['attributes'] = true;
                    }

                    if (configDict.indexOf('c') !== -1) {
                        observerDirective['childList'] = true;
                    }

                    if (configDict.indexOf('s') !== -1) {
                        observerDirective['subtree'] = true;
                    }
                } else {
                    outputConsole(
                        '[webViper] [ OBSERVER ] Observer configDict wrong for ' +
                            key +
                            ", use 'a' or 'c' and optional 's'."
                    );

                    continue;
                }

                if (!observerDirective['attributes'] && !observerDirective['childList']) {
                    outputConsole(
                        '[webViper] [ OBSERVER ] Observer configDict wrong for ' +
                            key +
                            ", either 'a' or 'c' must be present and optional 's' like 'as' or 'cs' or 'a' or 'c'."
                    );

                    continue;
                }

                outputConsole(
                    "[webViper] [ OBSERVER ] Observer observerDirective for '" +
                        key +
                        "' is setup correct, using: '" +
                        valueArray[0] +
                        "'"
                );

                outputConsole(
                    "[webViper] [ OBSERVER ] Observed source: '" + key + "' and target: '" + valueArray[1] + "'"
                );

                let dynamicObserver = new window.MutationObserver(cleanUpViperedNodes);

                // NOTE: Add custom funcs to the observer
                // Store node for reconnection retrieval
                dynamicObserver.getNodeKey = () => key;

                // Refresh observer connection
                dynamicObserver.reconnect = () => {
                    dynamicObserver.takeRecords();
                    dynamicObserver.disconnect();

                    let srcNodeKey = dynamicObserver.getNodeKey();
                    let node = getRefreshedNode(srcNodeKey);
                    if (doDebug) {
                        outputConsole('reconnecting observer..');
                    }

                    if (node !== false) {
                        dynamicObserver.observe(node, observerDirective);
                        if (doDebug) {
                            outputConsole('reconnected succesfully to node: ', node);
                        }
                    } else {
                        if (doDebug) {
                            outputConsole('connecting failed, node changed and not found, was: ', srcNode);
                        }
                    }
                };

                dynamicObserver.observe(srcNode, observerDirective);

                outputConsole("[webViper] [ OBSERVER ] Observer attached for: '" + key + "'");

                observerList.push(dynamicObserver);
                ++observersAttached;
            }

            return [observersAttached, observerDirectives];
        }

        return false;
    }

    function initObserver() {
        for (const url of Object.keys(baseRuleSet)) {
            if (currentPageLocation.indexOf(url) > -1) {
                outputConsole('[webViper] [ RUN ] Rule found, starting observer for: ' + url);

                currentPageTarget = url;

                // NOTE: Custom observer functions
                pageObserver.reconnectAll = () => {
                    if (doDebug) {
                        outputConsole('reconnecting by observerList');
                    }
                    for (let observer of observerList) {
                        if (doDebug) {
                            outputConsole('reconnect by observerList');
                        }

                        observer.reconnect();
                        if (doDebug) {
                            outputConsole('observer reconnected.');
                        }
                    }

                    clearInterval(pageloadCheckTimer);
                    pageloadCheckTimer = null;
                    pageObserver.reconnect();
                };

                pageObserver.disconnectAll = () => {
                    pageObserver.takeRecords();
                    pageObserver.disconnect();
                    if (doDebug) {
                        outputConsole('observer freed and disconnected..');
                    }

                    if (doDebug) {
                        outputConsole('disconnecting by observerList');
                    }
                    for (let observer of observerList) {
                        observer.takeRecords();
                        observer.disconnect();
                        if (doDebug) {
                            outputConsole('observer freed and disconnected..');
                        }
                    }

                    pageObserver.observe(document.body, pageObserverConfig);
                };

                pageObserver.reconnect = () => {
                    if (doDebug) {
                        outputConsole('(Re)connecting pageObserver');
                    }

                    pageObserver.takeRecords();
                    pageObserver.disconnect();
                    pageObserver.observe(document.body, pageObserverConfig);
                };

                pageObserver.observe(document.body, pageObserverConfig);
                pageloadCheckTimer = setInterval(resetLoad, 2000);
                return;
            }
        }

        outputConsole('[webViper] [ RUN ] No rule found for this website, not touching.');
    }

    window.requestAnimationFrame(initObserver);
}

// Lets get the party started!
scriptWrapper();
