<template>
  <section class="preview-page" :data-suite="activeSuite.id">
    <header class="preview-topbar">
      <div class="preview-brand">
        <span class="preview-brand__mark">知</span>
        <div>
          <strong>{{ activeSuite.name }}</strong>
          <small>{{ activeSuite.description }}</small>
        </div>
      </div>

      <nav class="suite-switcher" aria-label="页面方案集">
        <button
          v-for="suite in suites"
          :key="suite.id"
          type="button"
          :aria-pressed="suite.id === activeSuite.id"
          @click="selectSuite(suite.id)"
        >
          {{ suite.label }}
        </button>
      </nav>
    </header>

    <div class="preview-shell">
      <aside class="preview-nav">
        <p>{{ activeSuite.navLabel }}</p>
        <button
          v-for="page in activeSuite.pages"
          :key="page.id"
          type="button"
          :aria-pressed="page.id === activePage.id"
          @click="selectPage(page.id)"
        >
          <span>{{ page.title }}</span>
          <small>{{ page.meta }}</small>
        </button>
      </aside>

      <main class="preview-main">
        <section class="page-frame">
          <header class="page-frame__header">
            <div>
              <p>{{ activePage.context }}</p>
              <h1>{{ activePage.title }}</h1>
            </div>
            <div class="page-actions">
              <button
                v-for="action in activePage.actions"
                :key="action"
                type="button"
              >
                {{ action }}
              </button>
            </div>
          </header>

          <section
            v-if="activeSuite.id === 'reader' && activePage.id === 'feed'"
            class="reader-feed screen-layout screen-layout--reader"
          >
            <div class="toolbar-line">
              <button type="button" aria-pressed="true">最新</button>
              <button type="button">关注</button>
              <button type="button">技术架构</button>
              <label>
                <span>搜索</span>
                <input type="search" value="内容模型" />
              </label>
            </div>

            <section class="content-column">
              <article
                v-for="article in feedArticles"
                :key="article.title"
                class="article-row"
              >
                <div class="article-row__main">
                  <span>{{ article.category }}</span>
                  <h2>{{ article.title }}</h2>
                  <p>{{ article.summary }}</p>
                  <div class="meta-line">
                    <small>{{ article.author }}</small>
                    <small>{{ article.time }}</small>
                    <small>{{ article.tags }}</small>
                  </div>
                </div>
                <div class="article-row__signals">
                  <strong>{{ article.reads }}</strong>
                  <span>{{ article.engagement }}</span>
                </div>
              </article>
            </section>

            <aside class="side-rail">
              <section class="rail-panel">
                <h2>热门标签</h2>
                <div class="tag-list">
                  <span>Vue</span>
                  <span>Go</span>
                  <span>Content Model</span>
                  <span>Gateway</span>
                </div>
              </section>
              <section class="rail-panel">
                <h2>局部降级</h2>
                <p>互动状态暂不可确认时显示 unknown，不把收藏渲染成未选中。</p>
              </section>
            </aside>
          </section>

          <section
            v-else-if="activeSuite.id === 'reader' && activePage.id === 'article'"
            class="article-detail screen-layout screen-layout--article"
          >
            <article class="reading-pane">
              <div class="article-cover-strip"></div>
              <header class="article-title-block">
                <p>Content / 发布检查</p>
                <h2>发布检查如何保护结构化正文</h2>
                <div class="meta-line">
                  <small>陈志峰</small>
                  <small>2026-07-04</small>
                  <small>8 分钟阅读</small>
                </div>
              </header>
              <div class="article-body">
                <p>
                  正文是主资源，互动状态只是附加资源。文章可读时，点赞、收藏和
                  presence 的失败都不应该覆盖阅读流程。
                </p>
                <h3>保存事实</h3>
                <p>
                  编辑器输出 `schemaVersion + blocks`，预览消费结构化模型，而不是直接渲染用户输入的 HTML。
                </p>
                <pre><code>SaveDraftBodyReq {
  baseDraftHash: "sha256:..."
  body: { schemaVersion: 1, blocks: [...] }
}</code></pre>
              </div>
              <footer class="engagement-strip" aria-label="文章互动">
                <button type="button">赞 32</button>
                <button type="button" data-state="unknown">收藏 --</button>
                <button type="button">评论 14</button>
                <button type="button">分享</button>
              </footer>
            </article>

            <aside class="reader-inspector">
              <section>
                <h2>目录</h2>
                <a>保存事实</a>
                <a>冲突处理</a>
                <a>发布检查</a>
              </section>
              <section>
                <h2>作者</h2>
                <p>内容模型、Go 服务重建、前端工程边界。</p>
              </section>
              <section class="state-note">
                <strong>互动降级</strong>
                <span>收藏状态未知，正文继续可读。</span>
              </section>
            </aside>
          </section>

          <section
            v-else-if="activeSuite.id === 'reader' && activePage.id === 'workspace'"
            class="author-workspace screen-layout"
          >
            <div class="workspace-board">
              <nav class="section-tabs" aria-label="草稿状态">
                <button type="button" aria-pressed="true">草稿</button>
                <button type="button">已发布</button>
                <button type="button">定时</button>
                <button type="button">已删除</button>
              </nav>
              <div class="table-like">
                <div class="table-like__head">
                  <span>标题</span>
                  <span>状态</span>
                  <span>更新时间</span>
                  <span>操作</span>
                </div>
                <div
                  v-for="draft in drafts"
                  :key="draft.title"
                  class="table-like__row"
                >
                  <strong>{{ draft.title }}</strong>
                  <span :data-state="draft.state">{{ draft.stateLabel }}</span>
                  <small>{{ draft.updated }}</small>
                  <button type="button">{{ draft.action }}</button>
                </div>
              </div>
            </div>

            <aside class="side-rail">
              <section class="rail-panel">
                <h2>结构检查</h2>
                <ul class="check-list">
                  <li>标题层级完整</li>
                  <li>摘要缺失</li>
                  <li>正文 hash 未变化</li>
                </ul>
              </section>
              <section class="rail-panel rail-panel--action">
                <h2>本地草稿</h2>
                <p>保存失败不会丢弃本地输入，冲突时保留恢复入口。</p>
              </section>
            </aside>
          </section>

          <section
            v-else-if="activeSuite.id === 'admin' && activePage.id === 'security'"
            class="security-page screen-layout"
          >
            <section class="account-panel">
              <div class="identity-line">
                <div>
                  <span>当前主体</span>
                  <strong>architect0x0@foxmail.com</strong>
                </div>
                <small>ROLE_USER · ROLE_MODERATOR</small>
              </div>
              <div class="session-list">
                <div
                  v-for="session in sessions"
                  :key="session.device"
                  class="session-row"
                >
                  <div>
                    <strong>{{ session.device }}</strong>
                    <span>{{ session.meta }}</span>
                  </div>
                  <button type="button" :disabled="session.current">
                    {{ session.current ? "当前设备" : "撤销" }}
                  </button>
                </div>
              </div>
            </section>

            <aside class="side-rail">
              <section class="rail-panel rail-panel--warning">
                <h2>安全操作</h2>
                <p>Redis 投影处理中时，只清本地态，不承诺旧 token 已失效。</p>
              </section>
              <section class="operation-ledger">
                <h2>操作记录</h2>
                <ol>
                  <li>session revoke · succeeded</li>
                  <li>logout all · processing</li>
                  <li>csrf refresh · ready</li>
                </ol>
              </section>
            </aside>
          </section>

          <section
            v-else-if="activeSuite.id === 'admin' && activePage.id === 'moderation'"
            class="moderation-page screen-layout screen-layout--wide"
          >
            <section class="queue-panel">
              <div class="toolbar-line">
                <button type="button" aria-pressed="true">待处理</button>
                <button type="button">已处理</button>
                <button type="button">委托失败</button>
                <label>
                  <span>目标</span>
                  <input value="post/comment/user" />
                </label>
              </div>
              <div class="table-like table-like--moderation">
                <div class="table-like__head">
                  <span>举报目标</span>
                  <span>原因</span>
                  <span>下游状态</span>
                  <span>创建时间</span>
                </div>
                <div
                  v-for="report in reports"
                  :key="report.target"
                  class="table-like__row"
                >
                  <strong>{{ report.target }}</strong>
                  <span>{{ report.reason }}</span>
                  <small :data-state="report.state">{{ report.state }}</small>
                  <small>{{ report.time }}</small>
                </div>
              </div>
            </section>

            <aside class="decision-pane">
              <header>
                <span>选中举报</span>
                <h2>文章 · 外链风险</h2>
              </header>
              <dl>
                <div>
                  <dt>业务动作</dt>
                  <dd>等待 Content 委托确认</dd>
                </div>
                <div>
                  <dt>举报状态</dt>
                  <dd>pending</dd>
                </div>
                <div>
                  <dt>审计写入</dt>
                  <dd>ready</dd>
                </div>
              </dl>
              <label>
                <span>处理原因</span>
                <textarea :value="'疑似诱导外链，先隐藏后复核'"></textarea>
              </label>
              <div class="decision-actions">
                <button type="button">忽略</button>
                <button type="button">提交处理</button>
              </div>
            </aside>
          </section>

          <section
            v-else-if="activeSuite.id === 'admin' && activePage.id === 'notice'"
            class="notification-page screen-layout"
          >
            <section class="inbox-panel">
              <div class="notice-summary">
                <strong>7 未读</strong>
                <span>WebSocket 已连接 · 未读数同步正常</span>
                <button type="button">全部已读</button>
              </div>
              <div class="message-list">
                <button
                  v-for="notice in notices"
                  :key="notice.title"
                  type="button"
                  :aria-pressed="notice.active"
                >
                  <strong>{{ notice.title }}</strong>
                  <span>{{ notice.text }}</span>
                  <small>{{ notice.time }}</small>
                </button>
              </div>
            </section>

            <aside class="message-detail">
              <header>
                <span>评论回复</span>
                <h2>你的文章收到新的结构化反馈</h2>
              </header>
              <p>
                回复提到了 “blocks 保存契约” 和 “预览可信性”。相关评论可在文章详情中继续处理。
              </p>
              <div class="preference-list">
                <label><input type="checkbox" checked /> 站内通知</label>
                <label><input type="checkbox" checked /> 邮件摘要</label>
                <label><input type="checkbox" /> 免打扰</label>
              </div>
            </aside>
          </section>

          <section
            v-else-if="activeSuite.id === 'ops' && activePage.id === 'gateway'"
            class="ops-page screen-layout screen-layout--wide"
          >
            <section class="diagnostic-panel">
              <div class="ops-strip">
                <span>routing 正常</span>
                <span>auth fallback 1.7%</span>
                <span>redis degraded</span>
                <span>high risk blocked 12</span>
              </div>
              <div class="table-like table-like--routes">
                <div class="table-like__head">
                <span>方法 / 路径</span>
                <span>下游</span>
                  <span>auth</span>
                  <span>risk</span>
                  <span>p95</span>
                </div>
                <div
                  v-for="route in routes"
                  :key="route.path"
                  class="table-like__row"
                >
                  <strong>{{ route.path }}</strong>
                  <span>{{ route.target }}</span>
                  <small>{{ route.auth }}</small>
                  <small :data-state="route.risk">{{ route.risk }}</small>
                  <small>{{ route.p95 }}</small>
                </div>
              </div>
            </section>

            <aside class="diagnostic-detail">
              <header>
                <span>路由详情</span>
                <h2>DELETE /api/v1/admin/users/**</h2>
              </header>
              <dl>
                <div>
                  <dt>Headers</dt>
                  <dd>X-Account-ID · X-Request-ID · 已脱敏</dd>
                </div>
                <div>
                  <dt>Policy</dt>
                  <dd>ROLE_ADMIN · fail closed</dd>
                </div>
                <div>
                  <dt>Recent error</dt>
                  <dd>AUTH_PRINCIPAL_UNAVAILABLE</dd>
                </div>
              </dl>
            </aside>
          </section>

          <section
            v-else-if="activeSuite.id === 'ops' && activePage.id === 'tasks'"
            class="ops-task-page screen-layout"
          >
            <section class="task-composer">
              <div class="form-grid">
                <label>
                  <span>归属服务</span>
                  <input value="notification" />
                </label>
                <label>
                  <span>对象范围</span>
                  <input value="n_2000 - n_2480" />
                </label>
                <label class="form-grid__wide">
                  <span>执行原因</span>
                  <input value="修复未读数投影延迟" />
                </label>
              </div>
              <div class="impact-preview">
                <h2>预演结果</h2>
                <div>
                  <span>mismatch 24</span>
                  <span>missing 3</span>
                  <span>extra 0</span>
                  <span>suggested fix 27</span>
                </div>
              </div>
              <div class="decision-actions">
                <button type="button">预演</button>
                <button type="button">创建任务</button>
              </div>
            </section>

            <aside class="audit-timeline">
              <h2>审计轨迹</h2>
              <ol>
                <li>dry-run completed · 09:42</li>
                <li>执行原因已记录 · 09:43</li>
                <li>waiting approval · now</li>
              </ol>
            </aside>
          </section>

          <section
            v-else
            class="event-replay-page screen-layout"
          >
            <section class="replay-flow">
              <div class="replay-flow__source">
                <span>事件源</span>
                <strong>content.outbox</strong>
                <small>eventId 82 - 140</small>
              </div>
              <div class="replay-flow__source">
                <span>消费者</span>
                <strong>ranking.projector</strong>
                <small>按原分区回放</small>
              </div>
              <div class="replay-flow__source">
                <span>幂等策略</span>
                <strong>enabled</strong>
                <small>payload 摘要已脱敏</small>
              </div>
              <div class="result-grid">
                <span>produced 52</span>
                <span>skipped 7</span>
                <span>failed 1</span>
                <span>duplicated 0</span>
              </div>
            </section>

            <aside class="side-rail">
              <section class="rail-panel rail-panel--warning">
                <h2>失败聚合</h2>
                <p>1 条事件因 consumer timeout 失败，可按批次重试。</p>
              </section>
              <section class="rail-panel">
                <h2>敏感信息</h2>
                <p>不展示 payload 原文，只提供 eventId、routing key 和 trace。</p>
              </section>
            </aside>
          </section>
        </section>
      </main>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";

type SuiteId = "reader" | "admin" | "ops";

interface PreviewPage {
  id: string;
  title: string;
  meta: string;
  context: string;
  actions: string[];
}

interface PreviewSuite {
  id: SuiteId;
  label: string;
  name: string;
  description: string;
  navLabel: string;
  pages: PreviewPage[];
}

const suites: PreviewSuite[] = [
  {
    id: "reader",
    label: "内容产品面",
    name: "ZhiCore",
    description: "阅读、写作、互动",
    navLabel: "读 / 写 / 构",
    pages: [
      {
        id: "feed",
        title: "内容首页",
        meta: "文章流",
        context: "内容发现",
        actions: ["清空筛选", "写文章"],
      },
      {
        id: "article",
        title: "文章详情",
        meta: "正文与互动",
        context: "正文阅读",
        actions: ["收藏", "分享"],
      },
      {
        id: "workspace",
        title: "作者工作台",
        meta: "草稿治理",
        context: "作者资产",
        actions: ["新建草稿", "批量检查"],
      },
    ],
  },
  {
    id: "admin",
    label: "管理账号面",
    name: "ZhiCore Control",
    description: "账号、安全、审核",
    navLabel: "账号 / 审核 / 通知",
    pages: [
      {
        id: "security",
        title: "登录安全",
        meta: "会话管理",
        context: "账号安全",
        actions: ["刷新主体", "退出全部"],
      },
      {
        id: "moderation",
        title: "审核队列",
        meta: "举报处理",
        context: "审核编排",
        actions: ["分配", "提交处理"],
      },
      {
        id: "notice",
        title: "通知中心",
        meta: "消息和偏好",
        context: "通知投递",
        actions: ["全部已读", "通知偏好"],
      },
    ],
  },
  {
    id: "ops",
    label: "运维诊断面",
    name: "ZhiCore Ops",
    description: "Gateway、任务、事件",
    navLabel: "诊断 / 修复 / 回放",
    pages: [
      {
        id: "gateway",
        title: "Gateway 路由诊断",
        meta: "只读诊断",
        context: "入口诊断",
        actions: ["刷新", "复制 trace"],
      },
      {
        id: "tasks",
        title: "Ops 对账任务",
        meta: "dry-run",
        context: "对账修复",
        actions: ["预览影响", "创建任务"],
      },
      {
        id: "replay",
        title: "事件回放",
        meta: "幂等执行",
        context: "事件补偿",
        actions: ["估算范围", "开始回放"],
      },
    ],
  },
];

const activeSuiteId = ref<SuiteId>("reader");
const activePageIdBySuite = reactive<Record<SuiteId, string>>({
  reader: "feed",
  admin: "security",
  ops: "gateway",
});

const activeSuite = computed(
  () => suites.find((suite) => suite.id === activeSuiteId.value) ?? suites[0],
);

const activePage = computed(() => {
  const pageId = activePageIdBySuite[activeSuite.value.id];
  return (
    activeSuite.value.pages.find((page) => page.id === pageId) ??
    activeSuite.value.pages[0]
  );
});

const feedArticles = [
  {
    category: "Content",
    title: "把编辑器正文保存成稳定 blocks",
    summary:
      "保存契约收敛到 schemaVersion 与 blocks，前端只在预览和校验位置暴露结构事实。",
    author: "陈志峰",
    time: "18 分钟前",
    tags: "Vue · Content Model",
    reads: "1.2k",
    engagement: "32 赞 · -- 收藏",
  },
  {
    category: "Gateway",
    title: "Gateway 降级时如何保护高风险路由",
    summary:
      "Redis 不可用时区分 fail-open 与 fail-closed，高风险写路径不能继续放行。",
    author: "维护者",
    time: "1 小时前",
    tags: "Go · Security",
    reads: "680",
    engagement: "unknown",
  },
  {
    category: "Comment",
    title: "评论树的回复体验和折叠边界",
    summary:
      "主评论与回复编辑分层加载，评论失败不覆盖文章正文，回复失败保留输入。",
    author: "产品笔记",
    time: "昨天",
    tags: "Interaction",
    reads: "421",
    engagement: "14 评论",
  },
];

const drafts = [
  {
    title: "Content V1 正文发布切片",
    state: "ready",
    stateLabel: "可发布",
    updated: "2 分钟前",
    action: "继续编辑",
  },
  {
    title: "Redis 降级矩阵复盘",
    state: "warn",
    stateLabel: "摘要缺失",
    updated: "31 分钟前",
    action: "结构检查",
  },
  {
    title: "Notification 未读数重算",
    state: "draft",
    stateLabel: "本地草稿",
    updated: "昨天",
    action: "恢复",
  },
];

const sessions = [
  {
    device: "MacBook Pro",
    meta: "当前设备 · Chrome · 最近活跃 2 分钟前",
    current: true,
  },
  {
    device: "iPhone",
    meta: "Safari · 最近活跃 昨天",
    current: false,
  },
  {
    device: "Unknown Linux",
    meta: "安全撤销处理中 · operationId op_28",
    current: false,
  },
];

const reports = [
  {
    target: "文章 · 外链风险",
    reason: "疑似诱导外链",
    state: "pending",
    time: "09:28",
  },
  {
    target: "评论 · 人身攻击",
    reason: "用户举报",
    state: "ready",
    time: "09:11",
  },
  {
    target: "账号 · 垃圾内容",
    reason: "批量发布",
    state: "failed",
    time: "08:42",
  },
];

const notices = [
  {
    title: "评论回复",
    text: "你的文章收到新的结构化反馈。",
    time: "刚刚",
    active: true,
  },
  {
    title: "发布检查",
    text: "正文里有 2 个弱结构段落。",
    time: "12 分钟前",
    active: false,
  },
  {
    title: "系统通知",
    text: "安全操作已完成。",
    time: "昨天",
    active: false,
  },
];

const routes = [
  {
    path: "GET /api/v1/posts/**",
    target: "content",
    auth: "anonymous",
    risk: "normal",
    p95: "84ms",
  },
  {
    path: "POST /api/v1/auth/logout",
    target: "auth",
    auth: "session",
    risk: "high",
    p95: "122ms",
  },
  {
    path: "DELETE /api/v1/admin/users/**",
    target: "admin",
    auth: "ROLE_ADMIN",
    risk: "blocked",
    p95: "--",
  },
];

function selectSuite(suiteId: SuiteId): void {
  activeSuiteId.value = suiteId;
}

function selectPage(pageId: string): void {
  activePageIdBySuite[activeSuite.value.id] = pageId;
}
</script>

<style scoped>
.preview-page {
  --preview-bg: #f5f7fa;
  --preview-surface: #ffffff;
  --preview-surface-soft: #eef2f6;
  --preview-border: #d7dee7;
  --preview-border-soft: rgba(139, 151, 166, 0.28);
  --preview-text: #18212b;
  --preview-muted: #647083;
  --preview-strong: #07111f;
  --preview-accent: #305c7a;
  --preview-accent-soft: #e8eff4;
  --preview-success: #24705d;
  --preview-warning: #9a641c;
  --preview-danger: #a83c33;
  --preview-info: #345f98;
  min-height: 100vh;
  background: var(--preview-bg);
  color: var(--preview-text);
}

.preview-page[data-suite="admin"] {
  --preview-bg: #f6f7f4;
  --preview-surface-soft: #ecefea;
  --preview-accent: #3f6f4f;
  --preview-accent-soft: #e8f0ea;
}

.preview-page[data-suite="ops"] {
  --preview-bg: #eef3f6;
  --preview-surface-soft: #dfe8ee;
  --preview-accent: #385a76;
  --preview-accent-soft: #e4edf3;
}

.preview-topbar {
  position: sticky;
  top: 0;
  z-index: 4;
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
  min-height: 4.25rem;
  padding: 0.75rem clamp(1rem, 4vw, 2.5rem);
  border-bottom: 0.0625rem solid var(--preview-border);
  background: color-mix(in srgb, var(--preview-bg) 94%, transparent);
  backdrop-filter: blur(0.875rem);
}

.preview-brand,
.preview-brand > div,
.preview-nav,
.page-frame,
.content-column,
.side-rail,
.session-list,
.message-list,
.audit-timeline ol {
  display: grid;
}

.preview-brand {
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0.75rem;
  align-items: center;
}

.preview-brand__mark {
  display: grid;
  width: 2.25rem;
  height: 2.25rem;
  place-items: center;
  border-radius: 0.5rem;
  background: var(--preview-strong);
  color: var(--preview-surface);
  font-weight: 850;
}

.preview-brand strong,
.page-frame h1,
.article-row h2,
.surface-title,
.article-title-block h2,
.reading-pane h3,
.side-rail h2,
.decision-pane h2,
.message-detail h2,
.diagnostic-detail h2,
.impact-preview h2 {
  color: var(--preview-strong);
}

.preview-brand strong {
  font-size: 1rem;
  line-height: 1.1;
}

.preview-brand small,
.preview-nav p,
.preview-nav small,
.page-frame__header p,
.article-row span,
.article-row p,
.meta-line,
.side-rail p,
.side-rail li,
.session-row span,
.decision-pane dt,
.diagnostic-detail dt,
.message-list span,
.message-list small {
  color: var(--preview-muted);
}

.preview-brand small {
  font-size: 0.75rem;
}

.suite-switcher,
.section-tabs,
.toolbar-line {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.suite-switcher {
  padding: 0.25rem;
  border: 0.0625rem solid var(--preview-border);
  border-radius: 0.625rem;
  background: var(--preview-surface-soft);
}

button,
input,
textarea {
  font: inherit;
}

button {
  border: 0;
}

.suite-switcher button,
.preview-nav button,
.page-actions button,
.toolbar-line button,
.section-tabs button,
.table-like button,
.session-row button,
.decision-actions button,
.message-list button {
  cursor: pointer;
}

.suite-switcher button,
.toolbar-line button,
.section-tabs button,
.page-actions button {
  min-height: 2.25rem;
  border-radius: 0.5rem;
}

.suite-switcher button,
.toolbar-line button,
.section-tabs button {
  padding: 0.45rem 0.75rem;
  background: transparent;
  color: var(--preview-muted);
  font-size: 0.875rem;
  font-weight: 720;
}

.suite-switcher button[aria-pressed="true"],
.toolbar-line button[aria-pressed="true"],
.section-tabs button[aria-pressed="true"] {
  background: var(--preview-surface);
  color: var(--preview-strong);
}

.preview-shell {
  display: grid;
  grid-template-columns: minmax(13rem, 16rem) minmax(0, 1fr);
  min-height: calc(100vh - 4.25rem);
}

.preview-nav {
  align-content: start;
  gap: 0.5rem;
  padding: 1rem;
  border-right: 0.0625rem solid var(--preview-border);
  background: color-mix(in srgb, var(--preview-surface) 72%, transparent);
}

.preview-nav p {
  margin: 0.25rem 0 0.5rem;
  font-size: 0.8125rem;
  font-weight: 760;
}

.preview-nav button {
  display: grid;
  gap: 0.25rem;
  padding: 0.75rem;
  border: 0.0625rem solid transparent;
  border-radius: 0.5rem;
  background: transparent;
  color: var(--preview-text);
  text-align: left;
}

.preview-nav button[aria-pressed="true"] {
  border-color: var(--preview-border);
  background: var(--preview-surface);
}

.preview-main {
  min-width: 0;
  padding: clamp(1rem, 3vw, 2rem);
}

.page-frame {
  gap: 1rem;
  max-width: 84rem;
  margin: 0 auto;
}

.page-frame__header {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  justify-content: space-between;
}

.page-frame__header p {
  margin: 0 0 0.25rem;
  font-size: 0.8125rem;
  font-weight: 760;
}

.page-frame h1 {
  margin: 0;
  font-size: 1.75rem;
  line-height: 1.14;
  letter-spacing: 0;
}

.page-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: flex-end;
}

.page-actions button,
.decision-actions button,
.notice-summary button {
  min-height: 2.25rem;
  padding: 0.45rem 0.75rem;
  border: 0.0625rem solid var(--preview-border);
  border-radius: 0.5rem;
  background: var(--preview-surface);
  color: var(--preview-text);
  font-weight: 720;
}

.page-actions button:last-child,
.decision-actions button:last-child {
  border-color: var(--preview-accent);
  background: var(--preview-accent);
  color: var(--preview-surface);
}

.screen-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(18rem, 23rem);
  gap: 1rem;
  align-items: start;
}

.screen-layout--reader {
  grid-template-areas:
    "toolbar toolbar"
    "content rail";
}

.screen-layout--article {
  grid-template-columns: minmax(0, 46rem) minmax(16rem, 21rem);
  justify-content: center;
}

.screen-layout--wide {
  grid-template-columns: minmax(0, 1fr) minmax(21rem, 26rem);
}

.toolbar-line {
  grid-area: toolbar;
  align-items: center;
  padding: 0.5rem;
  border: 0.0625rem solid var(--preview-border);
  border-radius: 0.625rem;
  background: var(--preview-surface-soft);
}

.toolbar-line label,
.form-grid label,
.decision-pane label {
  display: grid;
  gap: 0.375rem;
}

.toolbar-line label {
  min-width: min(22rem, 100%);
  margin-left: auto;
}

.toolbar-line span,
.form-grid span,
.decision-pane label span {
  color: var(--preview-muted);
  font-size: 0.75rem;
  font-weight: 720;
}

input,
textarea {
  min-height: 2.25rem;
  border: 0.0625rem solid var(--preview-border);
  border-radius: 0.5rem;
  background: var(--preview-surface);
  color: var(--preview-text);
}

input {
  padding: 0.45rem 0.625rem;
}

textarea {
  min-height: 5rem;
  padding: 0.625rem;
  resize: vertical;
}

.content-column,
.side-rail {
  gap: 0.75rem;
}

.content-column {
  grid-area: content;
}

.side-rail {
  grid-area: rail;
}

.article-row,
.rail-panel,
.reading-pane,
.reader-inspector,
.workspace-board,
.account-panel,
.operation-ledger,
.queue-panel,
.decision-pane,
.inbox-panel,
.message-detail,
.diagnostic-panel,
.diagnostic-detail,
.task-composer,
.audit-timeline,
.replay-flow {
  border: 0.0625rem solid var(--preview-border);
  border-radius: 0.625rem;
  background: var(--preview-surface);
}

.article-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1.25rem;
  padding: 1rem;
}

.article-row__main {
  min-width: 0;
}

.article-row span,
.article-row__signals span {
  font-size: 0.8125rem;
  font-weight: 720;
}

.article-row h2,
.article-title-block h2 {
  margin: 0.25rem 0;
  line-height: 1.18;
  letter-spacing: 0;
}

.article-row h2 {
  font-size: 1.25rem;
}

.article-row p {
  max-width: 62ch;
  margin: 0.25rem 0 0;
  font-size: 0.9375rem;
  line-height: 1.62;
}

.meta-line {
  display: flex;
  flex-wrap: wrap;
  gap: 0.625rem;
  margin-top: 0.75rem;
  font-size: 0.8125rem;
}

.article-row__signals {
  display: grid;
  align-content: center;
  gap: 0.25rem;
  min-width: 6.5rem;
  text-align: right;
}

.article-row__signals strong {
  color: var(--preview-accent);
  font-size: 1.125rem;
}

.rail-panel,
.operation-ledger,
.reader-inspector section {
  padding: 1rem;
}

.rail-panel h2,
.operation-ledger h2,
.reader-inspector h2,
.impact-preview h2,
.audit-timeline h2 {
  margin: 0 0 0.75rem;
  font-size: 0.9375rem;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-list span,
.ops-strip span,
.result-grid span,
.impact-preview span {
  border-radius: 999rem;
  background: var(--preview-accent-soft);
  color: var(--preview-accent);
  font-size: 0.8125rem;
  font-weight: 760;
}

.tag-list span {
  padding: 0.375rem 0.5rem;
}

.rail-panel p,
.message-detail p {
  margin: 0;
  color: var(--preview-muted);
  font-size: 0.875rem;
  line-height: 1.58;
}

.article-cover-strip {
  height: 0.5rem;
  border-radius: 0.625rem 0.625rem 0 0;
  background: var(--preview-accent);
}

.article-title-block,
.article-body,
.engagement-strip {
  padding: 1.25rem;
}

.article-title-block {
  border-bottom: 0.0625rem solid var(--preview-border);
}

.article-title-block p {
  margin: 0;
  color: var(--preview-accent);
  font-size: 0.8125rem;
  font-weight: 760;
}

.article-title-block h2 {
  font-size: 2rem;
}

.article-body {
  color: var(--preview-text);
  font-size: 1rem;
  line-height: 1.72;
}

.article-body h3 {
  margin: 1.25rem 0 0.25rem;
  font-size: 1.125rem;
}

.article-body pre {
  overflow: auto;
  margin: 1rem 0 0;
  padding: 1rem;
  border-radius: 0.5rem;
  background: #18212b;
  color: #e7edf3;
  font-size: 0.875rem;
}

.engagement-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  border-top: 0.0625rem solid var(--preview-border);
}

.engagement-strip button {
  min-height: 2.25rem;
  padding: 0.45rem 0.75rem;
  border: 0.0625rem solid var(--preview-border);
  border-radius: 0.5rem;
  background: var(--preview-surface);
  color: var(--preview-text);
}

.engagement-strip button[data-state="unknown"] {
  color: var(--preview-warning);
}

.reader-inspector {
  display: grid;
  gap: 0;
  overflow: hidden;
}

.reader-inspector section + section {
  border-top: 0.0625rem solid var(--preview-border);
}

.reader-inspector a {
  display: block;
  margin-top: 0.5rem;
  color: var(--preview-text);
  text-decoration: none;
}

.state-note {
  display: grid;
  gap: 0.25rem;
  background: var(--preview-accent-soft);
}

.section-tabs {
  padding: 0.5rem;
  border-bottom: 0.0625rem solid var(--preview-border);
  background: var(--preview-surface-soft);
}

.table-like {
  overflow: auto;
}

.table-like__head,
.table-like__row {
  display: grid;
  gap: 1rem;
  align-items: center;
  min-width: 44rem;
  padding: 0.75rem 1rem;
}

.table-like__head {
  grid-template-columns: minmax(16rem, 1.8fr) minmax(7rem, 0.8fr) minmax(8rem, 0.8fr) minmax(7rem, 0.7fr);
  border-bottom: 0.0625rem solid var(--preview-border);
  color: var(--preview-muted);
  font-size: 0.75rem;
  font-weight: 760;
}

.table-like__row {
  grid-template-columns: minmax(16rem, 1.8fr) minmax(7rem, 0.8fr) minmax(8rem, 0.8fr) minmax(7rem, 0.7fr);
}

.table-like__row + .table-like__row {
  border-top: 0.0625rem solid var(--preview-border-soft);
}

.table-like__row strong {
  color: var(--preview-strong);
}

.table-like__row small,
.table-like__row span {
  font-size: 0.8125rem;
}

.table-like__row span[data-state="ready"],
.table-like__row small[data-state="ready"],
.table-like__row small[data-state="normal"] {
  color: var(--preview-success);
}

.table-like__row span[data-state="warn"],
.table-like__row small[data-state="pending"],
.table-like__row small[data-state="high"] {
  color: var(--preview-warning);
}

.table-like__row small[data-state="failed"],
.table-like__row small[data-state="blocked"] {
  color: var(--preview-danger);
}

.table-like button,
.session-row button {
  min-height: 2rem;
  border: 0.0625rem solid var(--preview-border);
  border-radius: 0.5rem;
  background: var(--preview-surface);
  color: var(--preview-text);
}

.table-like button {
  width: fit-content;
  padding: 0.35rem 0.625rem;
}

.check-list {
  display: grid;
  gap: 0.5rem;
  margin: 0;
  padding-left: 1rem;
}

.rail-panel--action,
.rail-panel--warning {
  background: var(--preview-accent-soft);
}

.identity-line,
.session-row,
.notice-summary {
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
}

.identity-line {
  padding: 1rem;
  border-bottom: 0.0625rem solid var(--preview-border);
}

.identity-line div,
.session-row div {
  display: grid;
  gap: 0.25rem;
}

.identity-line span {
  color: var(--preview-muted);
  font-size: 0.8125rem;
}

.identity-line strong {
  color: var(--preview-strong);
}

.session-list {
  gap: 0;
}

.session-row {
  padding: 1rem;
}

.session-row + .session-row {
  border-top: 0.0625rem solid var(--preview-border-soft);
}

.session-row button:disabled {
  cursor: default;
  opacity: 0.58;
}

.operation-ledger ol,
.audit-timeline ol {
  gap: 0.5rem;
  margin: 0;
  padding-left: 1.25rem;
  color: var(--preview-muted);
  font-size: 0.875rem;
}

.table-like--moderation .table-like__head,
.table-like--moderation .table-like__row {
  grid-template-columns: minmax(13rem, 1.3fr) minmax(9rem, 1fr) minmax(7rem, 0.8fr) minmax(5rem, 0.6fr);
}

.decision-pane,
.diagnostic-detail,
.message-detail {
  display: grid;
  gap: 1rem;
  padding: 1rem;
}

.decision-pane header span,
.message-detail header span,
.diagnostic-detail header span {
  color: var(--preview-muted);
  font-size: 0.8125rem;
  font-weight: 760;
}

.decision-pane h2,
.message-detail h2,
.diagnostic-detail h2 {
  margin: 0.25rem 0 0;
  font-size: 1.25rem;
  line-height: 1.2;
}

dl {
  display: grid;
  gap: 0.625rem;
  margin: 0;
}

dl div {
  display: grid;
  gap: 0.25rem;
  padding-bottom: 0.625rem;
  border-bottom: 0.0625rem solid var(--preview-border-soft);
}

dt,
dd {
  margin: 0;
}

dd {
  color: var(--preview-text);
}

.decision-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.notice-summary {
  padding: 1rem;
  border-bottom: 0.0625rem solid var(--preview-border);
}

.notice-summary strong {
  color: var(--preview-accent);
}

.notice-summary span {
  color: var(--preview-muted);
  font-size: 0.875rem;
}

.message-list {
  gap: 0;
}

.message-list button {
  display: grid;
  gap: 0.25rem;
  padding: 1rem;
  border: 0;
  border-bottom: 0.0625rem solid var(--preview-border-soft);
  background: transparent;
  color: var(--preview-text);
  text-align: left;
}

.message-list button[aria-pressed="true"] {
  background: var(--preview-accent-soft);
}

.preference-list {
  display: grid;
  gap: 0.5rem;
}

.preference-list label {
  color: var(--preview-text);
}

.ops-strip {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.5rem;
  padding: 0.75rem;
  border-bottom: 0.0625rem solid var(--preview-border);
}

.ops-strip span,
.result-grid span,
.impact-preview span {
  padding: 0.5rem 0.625rem;
  text-align: center;
}

.table-like--routes .table-like__head,
.table-like--routes .table-like__row {
  grid-template-columns: minmax(16rem, 1.5fr) minmax(7rem, 0.7fr) minmax(8rem, 0.8fr) minmax(6rem, 0.6fr) minmax(5rem, 0.5fr);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  padding: 1rem;
  border-bottom: 0.0625rem solid var(--preview-border);
}

.form-grid__wide {
  grid-column: 1 / -1;
}

.impact-preview {
  display: grid;
  gap: 0.75rem;
  padding: 1rem;
  border-bottom: 0.0625rem solid var(--preview-border);
}

.impact-preview div,
.result-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.5rem;
}

.task-composer .decision-actions {
  padding: 1rem;
}

.audit-timeline {
  padding: 1rem;
}

.replay-flow {
  display: grid;
  gap: 0.75rem;
  padding: 1rem;
}

.replay-flow__source {
  display: grid;
  grid-template-columns: 7rem minmax(0, 1fr) minmax(8rem, auto);
  gap: 1rem;
  align-items: center;
  padding: 0.875rem;
  border: 0.0625rem solid var(--preview-border-soft);
  border-radius: 0.5rem;
}

.replay-flow__source span,
.replay-flow__source small {
  color: var(--preview-muted);
}

.replay-flow__source strong {
  color: var(--preview-strong);
}

button:hover:not(:disabled),
button:focus-visible,
input:focus-visible,
textarea:focus-visible {
  outline: 0.125rem solid color-mix(in srgb, var(--preview-accent) 42%, transparent);
  outline-offset: 0.125rem;
}

@media (max-width: 64rem) {
  .preview-topbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .preview-shell,
  .screen-layout,
  .screen-layout--article,
  .screen-layout--wide {
    grid-template-columns: 1fr;
  }

  .preview-nav {
    grid-auto-flow: column;
    grid-auto-columns: minmax(10rem, 1fr);
    overflow-x: auto;
    border-right: 0;
    border-bottom: 0.0625rem solid var(--preview-border);
  }

  .screen-layout--reader {
    grid-template-areas:
      "toolbar"
      "content"
      "rail";
  }

  .toolbar-line label {
    margin-left: 0;
  }
}

@media (max-width: 44rem) {
  .preview-main {
    padding: 1rem;
  }

  .page-frame__header,
  .article-row,
  .identity-line,
  .session-row,
  .notice-summary,
  .replay-flow__source {
    align-items: flex-start;
    grid-template-columns: 1fr;
    flex-direction: column;
  }

  .article-row__signals {
    text-align: left;
  }

  .form-grid,
  .ops-strip,
  .impact-preview div,
  .result-grid {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.001ms !important;
  }
}
</style>
