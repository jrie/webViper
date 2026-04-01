// ==UserScript==
// @name         webViper
// @version      2026-04-01
// @description  vipe the web, like a pro, using the webViper
// @author       Jan Riechers
// @match        *://*/*
// @grant        none
// @run-at       document-idle
// @website      https://webviper.dwrox.net
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
        'gog.com': {
            keywords: ['in library', 'in der bibliothek'],
            excludes: [],
            removeElement: true,
            showUnhide: true,       // Should elements be available for unhiding using mouseover?
            animateUnhide: true,    // Should there be a animation when unhiding on mouseover?
            elementContainers: {
                'span.product-label__text': [
                    '.swiper-slide:has(big-spot)',
                    '.paginated-products-grid ~ a.product-tile',
                    'products-section-layout ~ a.product-tile',
                    'product-tile:has(store-picture)',
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
                '.paginated-products-grid': ['c', 'paginated-products-grid'],
                //'.catalog__display-wrapper': ['c', 'paginated-products-grid'],
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
        subtree: true,
        childList: false,
        attributes: true,
    };

    let observerList = [];
    let hasChange = true;
    let pageloadCheckTimer = null;
    let avoidedInsertions = 0;

    function show(replacement, toReplace) {
        toReplace.style.height = '0px';
        toReplace.style.minHeight = '0px';
        toReplace.style.maxHeight = '0px';
        toReplace.style.pointerEvents = 'none';

        replacement.style.overflow = 'visible';
        replacement.style.pointerEvents = 'all';
        replacement.style.minHeight = '0';
        replacement.style.height = replacement.customHeight;
        replacement.style.maxHeight = replacement.customHeight;

        toReplace.removeEventListener('mouseleave', function () {
            show(replacement, toReplace);
        });
    }

    function hide(replacement, toReplace) {
        replacement.style.overflow = 'hidden';
        replacement.style.height = '0px';
        replacement.style.minHeight = '0px';
        replacement.style.maxHeight = '0px';
        replacement.style.pointerEvents = 'none';

        toReplace.style.visibility = 'visible';
        toReplace.style.overflow = 'visible';
        toReplace.style.minHeight = '0';
        toReplace.style.height = toReplace.customHeight;
        toReplace.style.maxHeight = toReplace.customHeight;

        let replaceHeight = parseFloat(toReplace.customHeight) * 0.3;

        toReplace.parentNode.addEventListener('mouseleave', function () {
            function hideCheck() {
                if (toReplace.clientHeight <= replaceHeight) {
                    toReplace.style.visibility = 'hidden';
                    toReplace.style.overflow = 'hidden';
                    clearInterval(callToHide);
                }
            }

            let callToHide = setInterval(hideCheck, 10);
            show(replacement, toReplace);
        });

        setTimeout(function () {
            toReplace.style.pointerEvents = 'visible';
        }, 350);
    }

    function getLastChildInQueue(src) {
        if (src.children && src.children.length !== 0) {
            return getLastChildInQueue(src.children[src.children.length - 1]);
        }

        return src;
    }

    // -----------------------------------------------------------------------------------
    function replaceElement(keyword, toReplace, showUnhide, animateUnhide) {
        if (toReplace.parentNode) {
            if (toReplace.querySelector(':has(.was-vipered)') !== null) {
                // Avoid parsing of already viped elements or in case of nested elements.
                ++avoidedInsertions;
                return 3;
            }

            let lastChild = getLastChildInQueue(toReplace);
            lastChild.classList.add('was-vipered');

            const replaceText = 'This item was viped by';
            const replaceKeyword = 'webViper';

            toReplace = toReplace.children ? toReplace.children[toReplace.children.length - 1] : toReplace;
            toReplace.parentNode.style.position = 'relative';

            let customHeight = toReplace.offsetHeight + 'px';
            let customWidth = toReplace.offsetWidth + 'px';

            let replacement = document.createElement('span');
            replacement.className = 'vipered';

            replacement.style.textAlign = 'left';
            replacement.style.display = 'block';

            if (toReplace.children.length === 1) {
                replacement.style.position = 'absolute';
                replacement.style.top = '0px';
                replacement.style.left = '0px';
            }

            replacement.style.height = customHeight;
            replacement.style.minHeight = customHeight;
            replacement.style.maxHeight = '100%';
            replacement.style.width = customWidth;

            const wrapperSpan = document.createElement('span');
            wrapperSpan.style = 'color: #666; user-select: none; padding: 1.5vw 1.2vw; display: inline-block;';
            wrapperSpan.appendChild(document.createTextNode(replaceText));
            wrapperSpan.appendChild(document.createElement('br'));

            const keywordSpan = document.createElement('span');
            keywordSpan.style = 'color: red; font-weight: bold; font-size: 1.65vw;';
            keywordSpan.appendChild(document.createTextNode(replaceKeyword));
            wrapperSpan.appendChild(keywordSpan);
            replacement.appendChild(wrapperSpan);

            if (showUnhide) {
                replacement.style.position = 'absolute';
                replacement.style.top = '0px';
                replacement.style.left = '0px';
                replacement.style.maxWidth = customWidth;

                replacement.style.overflow = 'visible';
                replacement.style.visibility = 'visible';
                replacement.style.pointerEvents = 'visible';
                replacement.style.width = customWidth;
                replacement.style.maxWidth = customWidth;

                replacement.style.maxHeight = customHeight;
                replacement.style.height = customHeight;
                replacement.customWidth = customWidth;
                replacement.customHeight = customHeight;

                toReplace.style.overflow = 'hidden';
                toReplace.style.visibility = 'hidden';
                toReplace.style.pointerEvents = 'visible';
                toReplace.style.minHeight = '0px';
                toReplace.style.maxHeight = '0px';
                toReplace.style.height = '0px';
                toReplace.customWidth = customWidth;
                toReplace.customHeight = customHeight;

                if (animateUnhide) {
                    toReplace.style.transition = 'height 320ms, min-height 320ms';
                    toReplace.style.transitionTimingFunction = 'cubic-bezier';
                }

                function shortcutHide() {
                    hide(replacement, toReplace);
                }

                toReplace.parentNode.style.minHeight = customHeight;
                toReplace.parentNode.prepend(replacement);
                replacement.addEventListener('mouseenter', shortcutHide);
            } else {
                toReplace.style.pointerEvents = 'none';
                toReplace.parentNode.replaceChild(replacement, toReplace);
            }

            return 1;
        }

        return 2;
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
        targetShowUnhide,
        targetAnimateUnhide
    ) {
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

                const data = parentContainer.textContent.toLocaleLowerCase();

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
                            let result = replaceElement(
                                keyword,
                                parentContainer,
                                targetShowUnhide,
                                targetAnimateUnhide
                            );

                            if (result === 1) {
                                ++removedByKeywords[keyword];
                                break;
                            } else {
                                let target = parentContainer.querySelector('.was-vipered');
                                if (target !== null) {
                                    target.dispatchEvent(new MouseEvent('mouseenter'), { bubbles: true });
                                }

                                break;
                            }
                        }
                    }
                }
            }

            if (avoidedInsertions !== 0) {
                if (doDebug) {
                    outputConsole(
                        "[webViper] [ RUN ] [ POST PARSE ] Avoided insertions (reprocessing) for keyword '" +
                            containerKey +
                            "' ---> " +
                            avoidedInsertions
                    );

                    avoidedInsertions = 0;
                }
            }

            if (excludeCount !== 0) {
                outputConsole(
                    "[webViper] [ RUN ] [ POST PARSE ] Excluded for '" + containerKey + "' ---> " + excludeCount
                );
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
                let targetShowUnhide = false;
                let targetAnimateUnhide = false;

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

                if (Object.hasOwn(baseRuleSet[targetUrl], 'showUnhide') && baseRuleSet[targetUrl].showUnhide) {
                    targetShowUnhide = true;

                    if (Object.hasOwn(baseRuleSet[targetUrl], 'animateUnhide') && baseRuleSet[targetUrl].showUnhide) {
                        targetAnimateUnhide = true;
                    }
                }

                if (doDebug) {
                    outputConsole('[webViper] [ DEBUG ] global keywords    : ', targetGlobalKeywords);
                    outputConsole('[webViper] [ DEBUG ] rule               : ', targetUrl);
                    outputConsole('[webViper] [ DEBUG ] keywords           : ', targetKeywords);
                    outputConsole('[webViper] [ DEBUG ] elementContainers  : ', targetContainers);
                    outputConsole('[webViper] [ DEBUG ] excludes           : ', targetExcludes);
                    outputConsole('[webViper] [ DEBUG ] removeElement      : ', targetRemove);
                    outputConsole('[webViper] [ DEBUG ] showUnhide         : ', targetShowUnhide);
                }

                createKeywordsRemovalDict(removedByKeywords, targetGlobalKeywords);
                createKeywordsRemovalDict(removedByKeywords, targetKeywords);

                doParse(
                    removedByKeywords,
                    targetContainers,
                    targetExcludes,
                    targetHasExcludes,
                    targetRemove,
                    targetShowUnhide,
                    targetAnimateUnhide
                );
                break;
            }
        }

        let vipedByViper = 0;
        for (const key of Object.keys(removedByKeywords)) {
            const amount = removedByKeywords[key];
            if (amount > 0) {
                outputConsole('[webViper] Removed for keyword  : "' + key + '" ----> ' + amount);
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

    let observersAttached = false;
    let triedObserverAttach = false;

    function resetLoad() {
        if (!hasChange) {
            clearInterval(pageloadCheckTimer);
            pageloadCheckTimer = null;

            // NOTE: Load attached observers after the page finished loading
            if (!triedObserverAttach) {
                let result = attachObservers(baseRuleSet[currentPageTarget]);
                if (result && result !== false) {
                    outputConsole(
                        '[webViper] [ OBSERVER ] ' + result[0] + ' of ' + result[1] + ' observer(s) found and attached.'
                    );

                    if (doDebug) {
                        outputConsole('[webViper] [ OBSERVER ] List: ', observerList);
                    }

                    observersAttached = true;
                }

                triedObserverAttach = true;
            } else if (observersAttached) {
                for (let observer of observerList) {
                    observer.reconnect();
                }
            }

            pageObserver.takeRecords();
            pageObserver.disconnect();

            doVipe();
            pageObserver.reconnect();
            hasChange = true;
        }

        hasChange = false;
    }

    function checkLoad(mutations, srcObserver) {
        hasChange = true;

        if (!pageloadCheckTimer) {
            srcObserver.takeRecords();
            srcObserver.reconnect();

            pageloadCheckTimer = setInterval(resetLoad, 500);
        }
    }

    function cleanUpViperedNodes(mutations, srcObserver) {
        pageObserver.disconnect();

        let refreshedTarget = getRefreshedNode(srcObserver.nodeKey);

        if (refreshedTarget) {
            let nodeList = refreshedTarget.querySelectorAll(':has(.vipered)');

            for (const node of nodeList) {
                node.parentNode.removeChild(node);
            }
        } else {
            if (doDebug) {
                outputConsole("[!!] Node disappeared '" + srcObserver.nodeKey + "'");
            }
        }

        doVipe();
        pageObserver.reconnect();
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

            for (let key of Object.keys(observerDict)) {
                ++observerDirectives;

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
                dynamicObserver.nodeKey = key;

                // Refresh observer connection
                dynamicObserver.reconnect = function () {
                    dynamicObserver.takeRecords();
                    dynamicObserver.disconnect();

                    let node = getRefreshedNode(dynamicObserver.nodeKey);
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
                            outputConsole(
                                'connecting failed, node changed and not found, was: ',
                                dynamicObserver.nodeKey
                            );
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

                pageObserver.reconnect = function () {
                    pageObserver.takeRecords();
                    pageObserver.disconnect();
                    if (doDebug) {
                        outputConsole('(Re)connecting pageObserver');
                    }

                    pageObserver.observe(document.body, pageObserverConfig);
                };

                pageObserver.observe(document.body, pageObserverConfig);

                pageloadCheckTimer = setInterval(resetLoad, 500);
                return;
            }
        }

        outputConsole('[webViper] [ RUN ] No rule found for this website, not touching.');
    }

    window.requestAnimationFrame(initObserver);
}

// Lets get the party started!
scriptWrapper();
