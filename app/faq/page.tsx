'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { ChevronDown, Phone, Search, X, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

const goldEase = [0.76, 0, 0.24, 1] as const;
const softEase = [0.25, 0.1, 0.25, 1] as const;

/* ─── 数据 ─── */

interface FAQItem {
  question: string;
  answer: string;
  hot?: boolean;
}

interface FAQSection {
  id: string;
  title: string;
  items: FAQItem[];
}

const faqSections: FAQSection[] = [
  {
    id: 'about',
    title: '关于我们',
    items: [
      { question: 'Aurum Voyages 提供什么样的旅行服务？', answer: '我们专注于为中国高端旅行者打造沉浸式奢华旅行体验。服务包括：精选全球顶级目的地、私人定制行程、专属旅行管家全程陪同、米其林餐厅预订、私人飞机/游艇安排等。我们的目标是让每一次旅行都成为独一无二的人生体验。' },
      { question: '你们与普通旅行社有什么区别？', answer: '与传统旅行社不同，我们不提供大众化跟团游。每个行程都是小团或私人定制，最多不超过8人。我们拒绝购物点和隐形消费，专注于深度文化体验、独家资源获取（如闭馆后的博物馆私人导览）、以及超出预期的细节服务。' },
      { question: '旅行管家的职责是什么？', answer: '旅行管家是您的专属旅行顾问，从行程规划到旅途结束全程陪伴。他们负责：行程定制、酒店/餐厅预订、突发状况处理、当地资源协调、文化翻译等。每位管家平均拥有5年以上高端旅行服务经验，精通至少两门语言。' },
    ],
  },
  {
    id: 'experience',
    title: '行程体验',
    items: [
      { question: '行程中包含哪些服务？', answer: '标准行程包含：\n• 五星级或同等精品酒店住宿\n• 全程专车接送（含机场往返）\n• 每日精致早餐\n• 行程中标注的特色餐饮\n• 所有景点门票及体验活动\n• 旅行管家全程服务\n• 旅行保险\n\n机票通常不包含在基础价格中，但我们可为您安排。' },
      { question: '可以定制行程吗？', answer: '当然可以！我们的核心服务就是个性化定制。您可以：\n• 选择现有行程并调整细节\n• 完全从零开始定制专属行程\n• 增加特殊体验（如私人飞机、游艇、高尔夫等）\n• 根据特殊场合定制（蜜月、周年庆、生日等）\n\n请在预订时告诉我们您的需求，管家会为您量身打造。' },
      { question: '行程中的自由时间多吗？', answer: '我们注重劳逸结合。典型行程安排：\n• 上午：精选体验活动（2-3小时）\n• 中午：特色餐厅午餐\n• 下午：自由活动或可选体验\n• 晚上：精心安排的晚餐或文化活动\n\n您可以随时选择跳过任何活动，享受属于自己的时光。' },
    ],
  },
  {
    id: 'booking',
    title: '预订支付',
    items: [
      { question: '如何预订行程？', answer: '您可以通过以下方式预订：\n1. 在线提交预订表单，我们的管家会在24小时内与您联系\n2. 直接致电我们的VIP热线\n3. 通过微信/邮件联系您的专属管家\n\n预订确认后，您需要支付30%的定金以锁定行程，尾款在出发前30天支付。' },
      { question: '支持哪些支付方式？', answer: '我们支持以下支付方式：\n• 微信支付\n• 支付宝\n• 银行转账（对公账户）\n• 信用卡（Visa/Mastercard/银联）\n\n所有交易均通过加密通道处理，确保您的支付安全。' },
      { question: '可以取消或更改行程吗？', hot: true, answer: '我们理解计划可能有变：\n• 出发前60天以上：免费取消，全额退款\n• 出发前30-59天：收取10%手续费\n• 出发前15-29天：收取30%手续费\n• 出发前14天内：不可取消，但可转让\n\n行程更改视具体情况而定，我们会尽力协调。' },
    ],
  },
  {
    id: 'safety',
    title: '安全保障',
    items: [
      { question: '旅行保险包含什么？', answer: '每位旅行者自动获得旅行保险，包括：\n• 医疗费用保障（最高100万元）\n• 行程取消/中断保障\n• 行李延误/丢失保障\n• 紧急医疗撤离\n• 24小时全球紧急援助热线\n\n您也可以选择升级保险方案以获得更高保额。' },
      { question: '遇到紧急情况怎么办？', hot: true, answer: '我们提供全天候支持：\n• 旅行管家24小时可联系\n• 当地紧急联系人网络\n• 中文客服热线\n• 紧急医疗撤离服务\n\n无论何时何地，您都不会独自面对困难。' },
      { question: '你们如何保障服务质量？', answer: '我们通过多重机制确保服务品质：\n• 所有合作酒店/餐厅均经过实地考察\n• 旅行管家定期培训与考核\n• 每次行程后收集客户反馈\n• 不满意可申请服务补偿' },
    ],
  },
];

/* ─── 搜索高亮 ─── */

function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-[#C9A96E]/25 text-inherit rounded-sm px-0.5">{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

/* ─── 手风琴项 ─── */

function AccordionItem({ item, isOpen, onToggle, query }: {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
  query: string;
}) {
  return (
    <div className="group/item">
      <button
        onClick={onToggle}
        className="w-full text-left relative"
        style={{ padding: '28px 32px' }}
      >
        {/* 左侧金色指示线 */}
        <motion.div
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] rounded-full bg-[#C9A96E]"
          animate={{ height: isOpen ? 28 : 0, opacity: isOpen ? 1 : 0 }}
          whileHover={{ height: 20, opacity: 0.6 }}
          transition={{ duration: 0.3, ease: goldEase }}
        />

        <div className="flex items-start gap-5">
          {item.hot && (
            <span className="mt-0.5 flex-shrink-0 text-[10px] font-medium tracking-[1.5px] text-[#C9A96E] bg-[#C9A96E]/[0.08] px-2.5 py-1 rounded-full uppercase">
              HOT
            </span>
          )}
          <span className="flex-1 text-[#2c2a27] font-medium text-[16px] leading-[1.5] pr-4">
            <HighlightText text={item.question} query={query} />
          </span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.4, ease: goldEase }}
            className="flex-shrink-0 mt-1"
          >
            <ChevronDown size={18} className="text-[#C9A96E]" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.45, ease: goldEase },
              opacity: { duration: 0.35, delay: 0.08 },
            }}
            className="overflow-hidden"
          >
            <motion.div
              initial={{ y: -12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.35, delay: 0.12, ease: softEase }}
              style={{ padding: '0 32px 28px 32px' }}
            >
              <div className="ml-0 pl-6 border-l-[1.5px] border-[#C9A96E]/20">
                <p className="text-[#7a756c] text-[15px] leading-[1.9] whitespace-pre-line">
                  <HighlightText text={item.answer} query={query} />
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── 区块卡片 ─── */

function SectionCard({ section, sectionIndex, query, defaultOpenFirst }: {
  section: FAQSection;
  sectionIndex: number;
  query: string;
  defaultOpenFirst: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [openItems, setOpenItems] = useState<Record<number, boolean>>(
    defaultOpenFirst ? { 0: true } : {}
  );

  const toggleItem = useCallback((itemIndex: number) => {
    setOpenItems((prev) => ({ ...prev, [itemIndex]: !prev[itemIndex] }));
  }, []);

  return (
    <motion.div
      ref={ref}
      id={section.id}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, ease: goldEase }}
      className="scroll-mt-32"
    >
      {/* 区块标题 */}
      <div className="flex items-center gap-5 mb-8">
        <div className="w-[3px] h-9 bg-[#C9A96E] rounded-full flex-shrink-0" />
        <div>
          <h2 className="font-['Playfair_Display'] text-[clamp(22px,2.8vw,30px)] text-[#2c2a27] tracking-tight leading-tight">
            {section.title}
          </h2>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[#C9A96E] text-[13px] font-medium">{sectionIndex + 1}</span>
            <span className="text-[#c5c0b8] text-[12px]">/ {faqSections.length}</span>
          </div>
        </div>
      </div>

      {/* 手风琴卡片 */}
      <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-[#e8e4de]/80 shadow-[0_8px_50px_rgba(0,0,0,0.02)] overflow-hidden">
        {section.items.map((item, itemIndex) => (
          <div key={itemIndex}>
            <AccordionItem
              item={item}
              query={query}
              isOpen={openItems[itemIndex] || false}
              onToggle={() => toggleItem(itemIndex)}
            />
            {itemIndex < section.items.length - 1 && (
              <div className="mx-8 h-px bg-[#eae6e0]" />
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ─── 装饰分隔 ─── */

function SectionDivider() {
  return (
    <div className="flex items-center justify-center gap-4 my-16 md:my-20">
      <div className="w-16 h-px bg-gradient-to-r from-transparent to-[#C9A96E]/20" />
      <div className="w-[5px] h-[5px] bg-[#C9A96E]/30 rotate-45" />
      <div className="w-16 h-px bg-gradient-to-l from-transparent to-[#C9A96E]/20" />
    </div>
  );
}

/* ─── 主页面 ─── */

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState(0);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  // 搜索过滤
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return faqSections;
    const q = searchQuery.toLowerCase();
    return faqSections
      .map((section) => ({
        ...section,
        items: section.items.filter(
          (item) =>
            item.question.toLowerCase().includes(q) ||
            item.answer.toLowerCase().includes(q)
        ),
      }))
      .filter((section) => section.items.length > 0);
  }, [searchQuery]);

  // IntersectionObserver
  useEffect(() => {
    if (searchQuery) return;
    const observers = sectionRefs.current.map((ref, index) => {
      if (!ref) return null;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(index);
        },
        { rootMargin: '-30% 0px -55% 0px' }
      );
      observer.observe(ref);
      return observer;
    });
    return () => observers.forEach((o) => o?.disconnect());
  }, [searchQuery]);

  const scrollToSection = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="min-h-screen bg-[#f3ebe4] selection:bg-[#C9A96E] selection:text-white">
      {/* 背景装饰 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[700px] h-[700px] bg-[#C9A96E]/[0.025] rounded-full blur-[150px]" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[600px] h-[600px] bg-[#C9A96E]/[0.02] rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10">
        {/* ─── Hero ─── */}
        <div style={{ paddingTop: '140px', paddingBottom: '60px' }}>
          <div className="max-w-[720px] mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: goldEase }}
            >
              <p className="text-[#C9A96E] text-[11px] tracking-[5px] uppercase mb-7 font-medium">
                AURUM VOYAGES
              </p>
              <h1 className="font-['Playfair_Display'] text-[clamp(40px,5.5vw,64px)] text-[#2c2a27] mb-6 tracking-tight leading-[1.1]">
                常见问题
              </h1>
              <div className="w-14 h-px bg-[#C9A96E]/40 mx-auto mb-7" />
              <p className="text-[#9a958c] text-[clamp(15px,1.2vw,18px)] leading-[1.8]">
                在这里找到您需要的答案
              </p>
            </motion.div>
          </div>
        </div>

        {/* ─── 搜索框 ─── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25, ease: goldEase }}
          className="max-w-[560px] mx-auto px-6 mb-14"
        >
          <div className="relative">
            <Search size={17} className="absolute left-6 top-1/2 -translate-y-1/2 text-[#b5b0a7]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索您的问题..."
              className="w-full pl-14 pr-14 py-[18px] bg-white/50 backdrop-blur-sm border border-[#e0dbd5] rounded-full text-[15px] text-[#2c2a27] placeholder-[#b5b0a7] focus:outline-none focus:border-[#C9A96E]/60 focus:shadow-[0_0_0_4px_rgba(201,169,110,0.06)] transition-all duration-400"
              style={{ fontFamily: "'Inter', sans-serif" }}
            />
            <AnimatePresence>
              {searchQuery && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setSearchQuery('')}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-[#b5b0a7] hover:text-[#2c2a27] transition-colors duration-200"
                >
                  <X size={17} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ─── 分类标签 ─── */}
        {!isSearching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            className="max-w-[720px] mx-auto px-6 mb-20"
          >
            <div className="flex items-center justify-center gap-2.5 flex-wrap">
              {faqSections.map((section, i) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`relative px-6 py-2.5 rounded-full text-[13px] tracking-wide transition-all duration-400 ${
                    activeSection === i
                      ? 'bg-[#2c2a27] text-[#f3ebe4] shadow-[0_4px_20px_rgba(44,42,39,0.12)]'
                      : 'bg-white/40 text-[#8a857c] border border-[#e0dbd5]/80 hover:border-[#C9A96E]/40 hover:text-[#2c2a27] hover:bg-white/60'
                  }`}
                >
                  {section.title}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ─── 内容区 ─── */}
        <div className="max-w-[880px] mx-auto px-6 md:px-10 pb-16">
          <AnimatePresence mode="wait">
            {filteredSections.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center py-24"
              >
                <div className="w-16 h-16 rounded-full bg-[#C9A96E]/10 flex items-center justify-center mx-auto mb-6">
                  <Search size={24} className="text-[#C9A96E]" />
                </div>
                <p className="text-[#8a857c] text-[16px] mb-2">未找到相关问题</p>
                <p className="text-[#b5b0a7] text-[14px]">请尝试其他关键词，或直接联系我们的旅行管家</p>
              </motion.div>
            ) : (
              <motion.div key={isSearching ? 'search' : 'default'}>
                {filteredSections.map((section, sectionIndex) => (
                  <div
                    key={section.id}
                    ref={(el) => { sectionRefs.current[sectionIndex] = el; }}
                  >
                    <SectionCard
                      section={section}
                      sectionIndex={sectionIndex}
                      query={searchQuery}
                      defaultOpenFirst={sectionIndex === 0}
                    />
                    {sectionIndex < filteredSections.length - 1 && <SectionDivider />}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ─── 联系区域 ─── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.8, ease: goldEase }}
          className="max-w-[720px] mx-auto px-6 pb-28"
        >
          <div className="relative rounded-3xl overflow-hidden" style={{ padding: '1px' }}>
            {/* 渐变边框 */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#C9A96E]/25 via-[#C9A96E]/5 to-[#C9A96E]/20" />
            <div className="relative bg-[#f3ebe4] rounded-3xl" style={{ padding: '56px 40px' }}>
              <div className="text-center">
                <h3 className="font-['Playfair_Display'] text-[clamp(22px,2.8vw,30px)] text-[#2c2a27] mb-4 tracking-tight">
                  还有其他问题？
                </h3>
                <p className="text-[#9a958c] text-[15px] leading-[1.8] mb-10 max-w-md mx-auto">
                  我们的旅行管家随时为您解答，并为您量身定制专属行程
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
                  <Link
                    href="/booking"
                    className="group inline-flex items-center gap-2 px-8 py-3.5 bg-[#2c2a27] text-[#f3ebe4] font-medium rounded-full hover:bg-[#C9A96E] transition-all duration-500 text-[13px] tracking-wide"
                  >
                    开始预订
                    <ArrowUpRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                  <a
                    href="tel:+864000000000"
                    className="inline-flex items-center gap-2 px-8 py-3.5 border border-[#2c2a27]/15 text-[#2c2a27] font-medium rounded-full hover:border-[#C9A96E] hover:text-[#C9A96E] transition-all duration-500 text-[13px] tracking-wide"
                  >
                    <Phone size={14} />
                    致电咨询
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
