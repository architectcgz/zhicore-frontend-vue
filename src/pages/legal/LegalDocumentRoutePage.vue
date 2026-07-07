<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { FileText, ShieldCheck } from "@lucide/vue";

interface LegalSection {
  id: string;
  title: string;
  paragraphs: string[];
}

interface LegalDocument {
  badge: string;
  title: string;
  description: string;
  effectiveDate: string;
  sections: LegalSection[];
}

const route = useRoute();

const privacyPolicy: LegalDocument = {
  badge: "Privacy Policy",
  title: "隐私政策",
  description:
    "本政策说明 ZhiCore 在账号注册、内容创作、互动和平台安全场景中如何处理个人信息。",
  effectiveDate: "2026-07-07",
  sections: [
    {
      id: "scope",
      title: "一、适用范围",
      paragraphs: [
        "本政策适用于你访问或使用 ZhiCore 网站、账号系统、内容发布、评论、收藏、通知、私信及后续上线的相关服务。",
        "如果某项服务另有单独隐私说明，单独说明与本政策不一致的，以单独说明为准。",
      ],
    },
    {
      id: "collection",
      title: "二、我们收集的信息",
      paragraphs: [
        "账号信息：包括邮箱、昵称、头像、登录凭证状态和账号安全记录，用于注册、登录、身份识别和账号保护。",
        "内容与互动信息：包括你发布的文章、评论、收藏、点赞、关注、社区参与记录和消息内容，用于提供内容社区功能。",
        "设备与日志信息：包括 IP 地址、浏览器类型、访问时间、页面路径、错误日志和安全审计记录，用于保障服务稳定、安全与滥用防护。",
      ],
    },
    {
      id: "use",
      title: "三、信息使用方式",
      paragraphs: [
        "我们会将信息用于账号认证、内容展示、消息通知、社区互动、问题排查、服务改进和安全风控。",
        "在不识别特定个人的前提下，我们可能使用统计信息分析功能使用情况，帮助优化内容浏览、编辑器和社区体验。",
      ],
    },
    {
      id: "sharing",
      title: "四、信息共享与披露",
      paragraphs: [
        "除取得你的明确同意、履行法律义务、处理安全风险或保护平台及用户合法权益外，我们不会向第三方出售或出租你的个人信息。",
        "如未来接入邮件、对象存储、内容审核、监控告警等服务提供方，我们会要求其仅在必要范围内处理信息，并承担保密与安全义务。",
      ],
    },
    {
      id: "rights",
      title: "五、你的权利",
      paragraphs: [
        "你可以访问、修改账号资料，删除或更正自己发布的内容，并可按平台提供的入口申请注销账号或导出相关数据。",
        "当你认为信息处理存在问题时，可以通过页面公布的联系方式提出查询、更正、删除或撤回授权请求。",
      ],
    },
    {
      id: "security",
      title: "六、信息安全",
      paragraphs: [
        "我们会采用合理的技术和管理措施保护信息安全，包括访问控制、传输加密、日志审计和异常行为监测。",
        "互联网服务无法保证绝对安全。如发生可能影响你权益的安全事件，我们会按法律要求及时告知风险、处置措施和建议。",
      ],
    },
    {
      id: "updates",
      title: "七、政策更新",
      paragraphs: [
        "我们可能根据产品功能、法律要求或运营安排更新本政策。重大更新会通过站内公告、页面提示或其他合理方式通知你。",
        "本页面为草案文本，正式上线前应结合实际业务、数据流和适用法律进一步审核。",
      ],
    },
  ],
};

const termsOfService: LegalDocument = {
  badge: "Terms of Service",
  title: "用户协议",
  description:
    "本协议约定你与 ZhiCore 之间关于账号、内容创作、社区互动和平台服务使用的基本规则。",
  effectiveDate: "2026-07-07",
  sections: [
    {
      id: "acceptance",
      title: "一、协议接受",
      paragraphs: [
        "你注册、登录、访问或使用 ZhiCore，即表示你已阅读、理解并同意遵守本协议及平台发布的相关规则。",
        "如果你不同意本协议，请停止注册或使用相关服务。",
      ],
    },
    {
      id: "account",
      title: "二、账号与安全",
      paragraphs: [
        "你应提供真实、准确、完整的注册信息，并及时维护邮箱、昵称等账号资料。",
        "你应妥善保管账号和登录凭证。因你主动泄露、转让或授权他人使用账号造成的后果，由你自行承担。",
      ],
    },
    {
      id: "content",
      title: "三、内容发布与授权",
      paragraphs: [
        "你对自己发布的文章、评论、资料和其他内容承担责任，并保证其不侵犯第三方合法权益。",
        "你保留对原创内容的权利。为实现展示、分发、备份、推荐和安全审核等服务目的，你授权 ZhiCore 在平台范围内使用、存储、复制和展示相关内容。",
      ],
    },
    {
      id: "conduct",
      title: "四、用户行为规范",
      paragraphs: [
        "你不得发布违法违规、侵权、恶意攻击、垃圾推广、诱导欺诈、破坏平台安全或干扰他人正常使用的内容。",
        "不得以自动化脚本、批量请求、逆向工程、漏洞利用等方式破坏服务稳定性或绕过平台限制。",
      ],
    },
    {
      id: "moderation",
      title: "五、内容治理与服务处理",
      paragraphs: [
        "当内容或行为违反法律法规、本协议或社区规则时，ZhiCore 有权采取提示整改、限制展示、删除内容、限制功能、暂停或终止账号等处理措施。",
        "对于明显违法、有害或紧急风险内容，平台可先行处理，并在合理范围内向用户说明原因。",
      ],
    },
    {
      id: "availability",
      title: "六、服务变更与中断",
      paragraphs: [
        "ZhiCore 会努力保障服务稳定，但可能因维护、升级、网络故障、第三方服务异常或不可抗力导致服务中断或变更。",
        "我们可根据产品规划调整、暂停或终止部分功能，并尽量以合理方式提前通知。",
      ],
    },
    {
      id: "liability",
      title: "七、责任限制",
      paragraphs: [
        "你理解社区内容主要由用户发布，ZhiCore 不对用户内容的准确性、完整性或适用性作保证。",
        "在法律允许范围内，ZhiCore 对因使用或无法使用服务产生的间接损失、数据丢失或业务中断不承担超出法定范围的责任。",
      ],
    },
    {
      id: "updates",
      title: "八、协议更新",
      paragraphs: [
        "我们可能根据业务发展、法律要求或平台治理需要更新本协议。重大更新会通过站内公告、页面提示或其他合理方式通知。",
        "本页面为草案文本，正式上线前应结合实际业务、用户权益和适用法律进一步审核。",
      ],
    },
  ],
};

const currentDocument = computed(() =>
  route.name === "TermsOfService" ? termsOfService : privacyPolicy,
);

const alternateRoute = computed(() =>
  route.name === "TermsOfService"
    ? { name: "PrivacyPolicy" }
    : { name: "TermsOfService" },
);

const alternateLabel = computed(() =>
  route.name === "TermsOfService" ? "查看隐私政策" : "查看用户协议",
);
</script>

<template>
  <section class="legal-page" aria-labelledby="legal-page-title">
    <div class="legal-page__shell">
      <aside class="legal-page__summary" aria-label="文档摘要">
        <div class="legal-page__summary-icon">
          <ShieldCheck
            v-if="route.name === 'PrivacyPolicy'"
            aria-hidden="true"
          />
          <FileText v-else aria-hidden="true" />
        </div>
        <p class="legal-page__badge">{{ currentDocument.badge }}</p>
        <h1 id="legal-page-title">{{ currentDocument.title }}</h1>
        <p>{{ currentDocument.description }}</p>
        <dl class="legal-page__meta">
          <div>
            <dt>生效日期</dt>
            <dd>{{ currentDocument.effectiveDate }}</dd>
          </div>
          <div>
            <dt>文档状态</dt>
            <dd>草案</dd>
          </div>
        </dl>
        <RouterLink class="legal-page__alternate" :to="alternateRoute">
          {{ alternateLabel }}
        </RouterLink>
      </aside>

      <article class="legal-page__document">
        <section
          v-for="section in currentDocument.sections"
          :id="section.id"
          :key="section.id"
          class="legal-section"
        >
          <h2>{{ section.title }}</h2>
          <p v-for="paragraph in section.paragraphs" :key="paragraph">
            {{ paragraph }}
          </p>
        </section>
      </article>
    </div>
  </section>
</template>

<style scoped>
.legal-page {
  min-height: calc(100vh - 4.625rem);
  padding: var(--space-8);
  background:
    radial-gradient(
      circle at 14% 10%,
      color-mix(in srgb, var(--color-primary) 12%, transparent),
      transparent 20rem
    ),
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--color-bg-elevated) 18%, transparent),
      transparent 22rem
    );
  color: var(--color-text);
}

.legal-page__shell {
  display: grid;
  grid-template-columns: minmax(15rem, 20rem) minmax(0, 1fr);
  gap: var(--space-8);
  width: min(100%, 68rem);
  margin: 0 auto;
}

.legal-page__summary,
.legal-page__document {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--color-panel) 76%, transparent);
  backdrop-filter: blur(1rem);
  -webkit-backdrop-filter: blur(1rem);
}

.legal-page__summary {
  position: sticky;
  top: calc(4.625rem + var(--space-6));
  align-self: start;
  display: grid;
  gap: var(--space-4);
  padding: var(--space-6);
}

.legal-page__summary-icon {
  display: grid;
  width: 2.5rem;
  height: 2.5rem;
  place-items: center;
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--color-primary) 18%, transparent);
  color: var(--color-primary);
}

.legal-page__summary-icon svg {
  width: 1.25rem;
  height: 1.25rem;
}

.legal-page__badge {
  margin: 0;
  color: var(--color-primary);
  font-size: var(--font-size-ui-caption);
  font-weight: var(--font-weight-ui-control);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.legal-page__summary h1 {
  margin: 0;
  color: var(--color-text-strong);
  font-size: var(--font-size-ui-page-title);
  font-weight: var(--font-weight-ui-title);
  line-height: var(--line-height-ui-title);
}

.legal-page__summary p {
  margin: 0;
  font-size: var(--font-size-ui-body);
  line-height: var(--line-height-ui-body);
}

.legal-page__meta {
  display: grid;
  gap: var(--space-3);
  margin: 0;
  padding-top: var(--space-2);
}

.legal-page__meta div {
  display: grid;
  gap: var(--space-1);
}

.legal-page__meta dt {
  color: var(--color-text-soft);
  font-size: var(--font-size-ui-caption);
}

.legal-page__meta dd {
  margin: 0;
  color: var(--color-text-strong);
  font-size: var(--font-size-ui-meta);
  font-weight: var(--font-weight-ui-control);
}

.legal-page__alternate {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.5rem;
  border: 1px solid color-mix(in srgb, var(--color-primary) 42%, transparent);
  border-radius: var(--radius-md);
  color: var(--color-primary);
  font-size: var(--font-size-ui-body);
  font-weight: var(--font-weight-ui-control);
  text-decoration: none;
}

.legal-page__document {
  display: grid;
  gap: var(--space-6);
  padding: var(--space-8);
}

.legal-section {
  display: grid;
  gap: var(--space-3);
  padding-bottom: var(--space-6);
  border-bottom: 1px solid var(--color-border);
}

.legal-section:last-child {
  padding-bottom: 0;
  border-bottom: 0;
}

.legal-section h2 {
  margin: 0;
  color: var(--color-text-strong);
  font-size: var(--font-size-ui-section-title);
  font-weight: var(--font-weight-ui-title);
  line-height: var(--line-height-ui-title);
}

.legal-section p {
  margin: 0;
  color: var(--color-text);
  font-size: var(--font-size-ui-body);
  line-height: 1.8;
}

.legal-page__alternate:focus-visible {
  outline: 0.125rem solid var(--color-primary);
  outline-offset: 0.1875rem;
}

@media (max-width: 900px) {
  .legal-page {
    padding: var(--space-5);
  }

  .legal-page__shell {
    grid-template-columns: 1fr;
  }

  .legal-page__summary {
    position: static;
  }

  .legal-page__document {
    padding: var(--space-6);
  }
}

@media (max-width: 560px) {
  .legal-page {
    padding: var(--space-4) var(--space-4) var(--space-12);
  }

  .legal-page__summary,
  .legal-page__document {
    border-radius: var(--radius-md);
  }

  .legal-page__document {
    gap: var(--space-5);
    padding: var(--space-5);
  }
}
</style>
