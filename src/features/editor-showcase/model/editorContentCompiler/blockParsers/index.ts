import type { BlockParser } from "../types";

import { codeFenceParser } from "./codeFenceParser";
import { headingParser } from "./headingParser";
import { imageParser } from "./imageParser";
import { listParser } from "./listParser";
import { mathParser } from "./mathParser";
import { quoteParser } from "./quoteParser";
import { tableParser } from "./tableParser";

// 顺序表达 block 语法优先级：需要跨行判定的结构先于普通行级结构。
export const blockParsers: BlockParser[] = [
  codeFenceParser,
  tableParser,
  headingParser,
  quoteParser,
  listParser,
  imageParser,
  mathParser,
];
