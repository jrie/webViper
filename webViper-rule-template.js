//
// Rule template for "webViper" --> https://github.com/jrie/webViper
// for easier addition, just fill to get started..
//
// -----------------------------------------------------------------------------------
// webpage rules start
// -----------------------------------------------------------------------------------
let baseRuleSet = {
    // Start adding changes in here
    'gog.com': {
        keywords: ['in library', 'in der bibliothek'],
        excludes: [],
        removeElement: true,
        elementContainers: {
            'span.product-label__text': [
                '.swiper-slide:has(big-spot)',
                'products-section-layout ~ a.product-tile',
                'product-tile:has(store-picture)',
            ],
        },
    },
    globalKeywords: [],
};
// -----------------------------------------------------------------------------------
// webpage rules end - stop editing here
// -----------------------------------------------------------------------------------
