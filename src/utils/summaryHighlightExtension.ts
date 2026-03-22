import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

// Custom TipTap extension to highlight @summary lines
// Only highlights the FIRST @summary line in the document
export const SummaryHighlight = Extension.create({
  name: 'summaryHighlight',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('summaryHighlight'),
        props: {
          decorations(state) {
            const decorations: Decoration[] = [];
            const doc = state.doc;
            let foundFirst = false; // Track if we've found the first @summary

            doc.descendants((node, pos) => {
              // Stop searching if we've already found the first summary
              if (foundFirst) return false;

              if (node.type.name === 'paragraph') {
                const text = node.textContent.trim();
                if (text.startsWith('@summary ')) {
                  decorations.push(
                    Decoration.node(pos, pos + node.nodeSize, {
                      class: 'summary-line-highlight',
                    })
                  );
                  foundFirst = true; // Mark that we found it
                  return false; // Stop traversing
                }
              }
            });

            return DecorationSet.create(doc, decorations);
          },
        },
      }),
    ];
  },
});
