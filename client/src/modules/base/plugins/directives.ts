/**
 * Trim whitespace of given element by:
 * 1. Removing direct child comment nodes
 * 2. Trimming leading and trailing whitespace of direct child text nodes
 *
 * Example:
 *
 * Given HTML:
 * ```html
 * <div>
 *   test:
 *   <!-- Comment -->
 *   Hello :
 *   <span>world </span><span>1</span>
 * </div>
 * ```
 *
 * Naive trimming:
 * ```ts
 * console.log(divEl.textContent.trim());
 * // prints:
 * `test:
 *
 *   Hello :
 *   world
 * `
 * ```
 *
 * This trimming:
 * ```ts
 * console.log(trimEl(divEl).trim());
 * // prints:
 * `test:Hello :world 1`
 * // NOTE 1: Space between "Hello" and colon is preserved, because it's
 * //         INSIDE a text node.
 * // NOTE 2: Space between "world" and "1" is preserved, because although the
 * //         whitespace is trailing, it's also inside `<span>`, so the text node
 * //         is not a direct child.
 * ```
 */
const trimEl = (el: HTMLElement) => {
  const childNodes = [...el.childNodes];
  childNodes.forEach((node) => {
    if (node.nodeType === Node.COMMENT_NODE) {
      node.remove();
    } else if (node.nodeType === Node.TEXT_NODE && node.textContent) {
      node.textContent = node.textContent?.trim();
    }
  });
  // Return el itself for more convenient usage
  // E.g. `trimEl(someEl).textContent`
  return el;
};

// See https://nuxt.com/docs/guide/directory-structure/plugins#creating-plugins
const directivesPlugin = defineNuxtPlugin({
  name: 'directives',
  async setup(nuxtApp) {
    const { vueApp } = nuxtApp;

    // Trim whitespace of given element by removing comment nodes and trimming
    // leading and trailing whitespace for each text child
    vueApp.directive('trim', {
      beforeMount: (el: HTMLElement) => {
        trimEl(el);
      },
    });
  },
});

export default directivesPlugin;
