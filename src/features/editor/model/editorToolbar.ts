import type { EditorToolbarAction } from "./editorToolbarTypes";

export interface EditorToolbarItem {
  action: EditorToolbarAction;
  label: string;
  title: string;
}

export interface EditorToolbarGroup {
  id: string;
  items: EditorToolbarItem[];
}

export const editorToolbarGroups: EditorToolbarGroup[] = [
  {
    id: "inline",
    items: [
      { action: "bold", label: "B", title: "加粗" },
      { action: "italic", label: "I", title: "斜体" },
      { action: "underline", label: "U", title: "下划线" },
      { action: "strike", label: "S", title: "删除线" },
      { action: "inlineCode", label: "`", title: "行内代码" },
      { action: "link", label: "Link", title: "插入链接" },
    ],
  },
  {
    id: "heading",
    items: [
      { action: "heading1", label: "H1", title: "一级标题" },
      { action: "heading2", label: "H2", title: "二级标题" },
      { action: "heading3", label: "H3", title: "三级标题" },
      { action: "heading4", label: "H4", title: "四级标题" },
      { action: "heading5", label: "H5", title: "五级标题" },
      { action: "heading6", label: "H6", title: "六级标题" },
    ],
  },
  {
    id: "block",
    items: [
      { action: "quote", label: ">", title: "引用块" },
      { action: "unorderedList", label: "-", title: "无序列表" },
      { action: "orderedList", label: "1.", title: "有序列表" },
      { action: "taskList", label: "[]", title: "任务列表" },
      { action: "image", label: "Img", title: "插入图片" },
      { action: "code", label: "Code", title: "代码块" },
      { action: "table", label: "Tbl", title: "表格" },
      { action: "math", label: "Math", title: "数学公式" },
    ],
  },
];
