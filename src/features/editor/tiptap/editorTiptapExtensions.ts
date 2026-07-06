import {
  type Editor,
  Extension,
  mergeAttributes,
  Node as TiptapNode,
  type Extensions,
  type NodeViewRendererProps,
} from "@tiptap/core";
import { CodeBlock } from "@tiptap/extension-code-block";
import Link from "@tiptap/extension-link";
import { Table } from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import Underline from "@tiptap/extension-underline";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import StarterKit from "@tiptap/starter-kit";
import { Plugin, TextSelection } from "@tiptap/pm/state";
import { isInTable, selectedRect } from "@tiptap/pm/tables";
import type { NodeView, ViewMutationRecord } from "@tiptap/pm/view";

import { sanitizePostBodyExternalUrl } from "@/entities/post-body";

import {
  editorCodeBlockLanguageOptions,
  normalizeEditorCodeBlockLanguage,
  serializeEditorCodeBlockLanguage,
} from "../config/editorCodeBlockLanguages";
import {
  getTiptapPlainText,
  mapTiptapJsonToPostBodyWriteInput,
} from "./editorTiptapEngine";

export interface EditorTiptapContractGuardOptions {
  getBodyMaxLength?: () => number;
}

function createEditorCodeBlockNodeView(
  props: NodeViewRendererProps,
  languageClassPrefix: string | null | undefined,
): NodeView {
  let currentNode = props.node;
  const dom = document.createElement("div");
  const languageBar = document.createElement("div");
  const languageLabel = document.createElement("span");
  const languageSelect = document.createElement("select");
  const pre = document.createElement("pre");
  const code = document.createElement("code");

  dom.className = "editor-code-block";
  languageBar.className = "editor-code-block__language-bar";
  languageLabel.className = "editor-code-block__language-label";
  languageLabel.textContent = "语言";
  languageSelect.className = "editor-code-block__language-select";
  languageSelect.setAttribute("aria-label", "选择代码语言");

  editorCodeBlockLanguageOptions.forEach((language) => {
    const option = document.createElement("option");

    option.value = language.value;
    option.textContent = language.label;
    languageSelect.append(option);
  });

  languageBar.append(languageLabel, languageSelect);
  pre.append(code);
  dom.append(languageBar, pre);

  function syncLanguage(node: ProseMirrorNode): void {
    const language = normalizeEditorCodeBlockLanguage(node.attrs.language);
    const serializedLanguage = serializeEditorCodeBlockLanguage(language);

    currentNode = node;
    languageSelect.value = language;
    code.className =
      serializedLanguage && languageClassPrefix
        ? `${languageClassPrefix}${serializedLanguage}`
        : "";
  }

  function updateLanguage(): void {
    const position = props.getPos();

    if (typeof position !== "number") {
      return;
    }

    const language = normalizeEditorCodeBlockLanguage(languageSelect.value);
    const nextLanguage = serializeEditorCodeBlockLanguage(language);
    const transaction = props.view.state.tr.setNodeMarkup(position, undefined, {
      ...currentNode.attrs,
      language: nextLanguage,
    });

    // 代码块内的语言栏不属于可编辑正文，必须按 node 位置更新属性，避免依赖当前文本选区。
    props.view.dispatch(transaction);
  }

  function isFromLanguageBar(eventOrMutation: Event | ViewMutationRecord) {
    const target = eventOrMutation.target;

    return target instanceof globalThis.Node && languageBar.contains(target);
  }

  languageSelect.addEventListener("change", updateLanguage);
  syncLanguage(currentNode);

  return {
    dom,
    contentDOM: code,
    update(node) {
      if (node.type !== currentNode.type) {
        return false;
      }

      syncLanguage(node);
      return true;
    },
    stopEvent(event) {
      return isFromLanguageBar(event);
    },
    ignoreMutation(mutation) {
      return mutation.type !== "selection" && isFromLanguageBar(mutation);
    },
    destroy() {
      languageSelect.removeEventListener("change", updateLanguage);
    },
  };
}

export const EditorTiptapCodeBlock = CodeBlock.extend({
  addNodeView() {
    const languageClassPrefix = this.options.languageClassPrefix;

    return (props) => createEditorCodeBlockNodeView(props, languageClassPrefix);
  },
});

export const EditorTiptapMathBlock = TiptapNode.create({
  name: "math_block",
  group: "block",
  content: "text*",
  code: true,
  defining: true,

  addAttributes() {
    return {
      latex: {
        default: "",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "pre[data-math]",
        getAttrs: (element) => {
          if (!(element instanceof HTMLElement)) {
            return {};
          }

          return { latex: element.dataset.latex ?? element.textContent ?? "" };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "pre",
      mergeAttributes(HTMLAttributes, {
        "data-math": "true",
        "data-latex": HTMLAttributes.latex,
      }),
      0,
    ];
  },
});

export const EditorTiptapExternalEmbed = TiptapNode.create({
  name: "external_embed",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      provider: {
        default: "image",
      },
      url: {
        default: "https://example.com/image.png",
      },
      title: {
        default: "图片说明",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "figure[data-external-embed]",
        getAttrs: (element) => {
          if (!(element instanceof HTMLElement)) {
            return {};
          }

          return {
            provider: element.dataset.externalEmbed ?? "image",
            url: element.dataset.url ?? "https://example.com/image.png",
            title: element.dataset.title ?? "图片说明",
          };
        },
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const url = sanitizePostBodyExternalUrl(String(node.attrs.url ?? ""));
    const title = String(node.attrs.title ?? "");

    if (!url) {
      return [
        "figure",
        mergeAttributes(HTMLAttributes, {
          "data-external-embed": node.attrs.provider,
          "data-title": title,
        }),
        ["span", title || "外部资源链接不安全"],
      ];
    }

    return [
      "figure",
      mergeAttributes(HTMLAttributes, {
        "data-external-embed": node.attrs.provider,
        "data-url": url,
        "data-title": title,
      }),
      ["a", { href: url }, title || url],
    ];
  },
});

function isCursorAtTextblockEnd(editor: Editor): boolean {
  const { selection } = editor.state;

  return (
    selection.empty &&
    selection.$head.parent.isTextblock &&
    selection.$head.parentOffset === selection.$head.parent.content.size
  );
}

function moveCursorToParagraphAfterLastTableCell(editor: Editor): boolean {
  const { state, view } = editor;

  if (!isCursorAtTextblockEnd(editor) || !isInTable(state)) {
    return false;
  }

  const tableRect = selectedRect(state);
  const isLastTableCell =
    tableRect.right === tableRect.map.width &&
    tableRect.bottom === tableRect.map.height;

  if (!isLastTableCell) {
    return false;
  }

  const paragraph = state.schema.nodes.paragraph?.createAndFill();

  if (!paragraph) {
    return false;
  }

  // 作者在表格末格继续向右/向下时，意图是续写表格后的正文，而不是新增表格行或停在 gap cursor。
  const tableEndPosition = tableRect.tableStart + tableRect.table.nodeSize - 1;
  const transaction = state.tr.insert(tableEndPosition, paragraph);

  transaction
    .setSelection(TextSelection.create(transaction.doc, tableEndPosition + 1))
    .scrollIntoView();

  view.dispatch(transaction);
  return true;
}

const EditorTiptapTableExit = Extension.create({
  name: "editorTableExit",

  addKeyboardShortcuts() {
    return {
      ArrowRight: () => moveCursorToParagraphAfterLastTableCell(this.editor),
      ArrowDown: () => moveCursorToParagraphAfterLastTableCell(this.editor),
    };
  },
});

function findClickedLinkElement(
  target: EventTarget | null,
): HTMLAnchorElement | null {
  if (!(target instanceof HTMLElement)) {
    return null;
  }

  return target.closest<HTMLAnchorElement>("a[href]");
}

function setModifierLinkOpenClass(
  element: HTMLElement,
  isActive: boolean,
): void {
  element.classList.toggle("editor-link-open-modifier", isActive);
}

const EditorTiptapModifierLinkOpen = Extension.create({
  name: "editorModifierLinkOpen",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handleDOMEvents: {
            keydown(view, event) {
              if (event instanceof KeyboardEvent) {
                setModifierLinkOpenClass(
                  view.dom,
                  event.ctrlKey || event.metaKey,
                );
              }

              return false;
            },
            keyup(view, event) {
              if (event instanceof KeyboardEvent) {
                setModifierLinkOpenClass(
                  view.dom,
                  event.ctrlKey || event.metaKey,
                );
              }

              return false;
            },
            mousemove(view, event) {
              if (event instanceof MouseEvent) {
                setModifierLinkOpenClass(
                  view.dom,
                  event.ctrlKey || event.metaKey,
                );
              }

              return false;
            },
            mouseleave(view) {
              setModifierLinkOpenClass(view.dom, false);
              return false;
            },
            click(view, event) {
              if (
                !(event instanceof MouseEvent) ||
                (!event.ctrlKey && !event.metaKey)
              ) {
                return false;
              }

              const linkElement = findClickedLinkElement(event.target);
              const href = linkElement
                ? sanitizePostBodyExternalUrl(linkElement.href)
                : null;

              if (!href) {
                return false;
              }

              event.preventDefault();
              window.open(href, "_blank", "noopener,noreferrer");
              setModifierLinkOpenClass(view.dom, false);
              return true;
            },
          },
        },
        view(view) {
          const syncModifierClass = (event: KeyboardEvent): void => {
            setModifierLinkOpenClass(view.dom, event.ctrlKey || event.metaKey);
          };
          const clearModifierClass = (): void => {
            setModifierLinkOpenClass(view.dom, false);
          };

          window.addEventListener("keydown", syncModifierClass);
          window.addEventListener("keyup", syncModifierClass);
          window.addEventListener("blur", clearModifierClass);

          return {
            destroy() {
              window.removeEventListener("keydown", syncModifierClass);
              window.removeEventListener("keyup", syncModifierClass);
              window.removeEventListener("blur", clearModifierClass);
            },
          };
        },
      }),
    ];
  },
});

export function createEditorTiptapContractGuardExtension(
  options: EditorTiptapContractGuardOptions = {},
) {
  return Extension.create({
    name: "editorPostBodyContractGuard",

    addProseMirrorPlugins() {
      return [
        new Plugin({
          filterTransaction(transaction) {
            if (!transaction.docChanged) {
              return true;
            }

            const documentJson = transaction.doc.toJSON();
            const bodyMaxLength = options.getBodyMaxLength?.();

            if (
              typeof bodyMaxLength === "number" &&
              getTiptapPlainText(documentJson).length > bodyMaxLength
            ) {
              return false;
            }

            try {
              // 保存契约 guard 在文档进入 editor state 前执行；不兼容 Content V1 的结构不应流入 draft owner。
              mapTiptapJsonToPostBodyWriteInput(documentJson);
              return true;
            } catch {
              return false;
            }
          },
        }),
      ];
    },
  });
}

export function createEditorTiptapExtensions(
  options: EditorTiptapContractGuardOptions = {},
): Extensions {
  return [
    StarterKit.configure({
      undoRedo: false,
      link: false,
      underline: false,
      trailingNode: false,
      hardBreak: false,
      horizontalRule: false,
      blockquote: {},
      bulletList: {},
      codeBlock: false,
      heading: {
        levels: [1, 2, 3, 4, 5, 6],
      },
      orderedList: {},
    }),
    EditorTiptapCodeBlock,
    Underline,
    Link.configure({
      openOnClick: false,
      autolink: false,
      linkOnPaste: false,
    }),
    EditorTiptapModifierLinkOpen,
    Table.configure({
      resizable: false,
    }),
    TableRow,
    TableHeader,
    TableCell,
    EditorTiptapTableExit,
    TaskList,
    TaskItem.configure({
      nested: true,
    }),
    EditorTiptapMathBlock,
    EditorTiptapExternalEmbed,
    createEditorTiptapContractGuardExtension(options),
  ];
}
