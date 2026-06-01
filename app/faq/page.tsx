'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MessageCircle, Phone, Mail, MapPin, Shield, CreditCard, Plane, Clock, Users, Star } from 'lucide-react';
import Link from 'next/link';

const goldEase = [0.76, 0, 0.24, 1] as const;

interface FAQItem {
  question: string;
  answer: string;
  icon: React.ReactNode;
}

interface FAQSection {
  title: string;
  icon: React.ReactNode;
  items: FAQItem[];
}

const faqSections: FAQSection[] = [
  {
    title: '关于我们的服务',
    icon: <Star size={20} />,
    items: [
      {
        question: 'Aurum Voyages 提供什么样的旅行服务？',
        answer: '我们专注于为中国高端旅行者打造沉浸式奢华旅行体验。服务包括：精选全球顶级目的地、私人定制行程、专属旅行管家全程陪同、米其林餐厅预订、私人飞机/游艇安排等。我们的目标是让每一次旅行都成为独一无二的人生体验。',
        icon: <Plane size={18} />,
      },
      {
        question: '你们与普通旅行社有什么区别？',
        answer: '与传统旅行社不同，我们不提供大众化跟团游。每个行程都是小团或私人定制，最多不超过8人。我们拒绝购物点和隐形消费，专注于深度文化体验、独家资源获取（如闭馆后的博物馆私人导览）、以及超出预期的细节服务。',
        icon: <Users size={18} />,
      },
      {
        question: '旅行管家的职责是什么？',
        answer: '旅行管家是您的专属旅行顾问，从行程规划到旅途结束全程陪伴。他们负责：行程定制、酒店/餐厅预订、突发状况处理、当地资源协调、文化翻译等。每位管家平均拥有5年以上高端旅行服务经验，精通至少两门语言。',
        icon: <MapPin size={18} />,
      },
    ],
  },
  {
    title: '预订与支付',
    icon: <CreditCard size={20} />,
    items: [
      {
        question: '如何预订行程？',
        answer: '您可以通过以下方式预订：\n1. 在线提交预订表单，我们的管家会在24小时内与您联系\n2. 直接致电我们的VIP热线\n3. 通过微信/邮件联系您的专属管家\n\n预订确认后，您需要支付30%的定金以锁定行程，尾款在出发前30天支付。',
        icon: <CreditCard size={18} />,
      },
      {
        question: '支持哪些支付方式？',
        answer: '我们支持以下支付方式：\n• 微信支付\n• 支付宝\n• 银行转账（对公账户）\n• 信用卡（Visa/Mastercard/银联）\n\n所有交易均通过加密通道处理，确保您的支付安全。',
        icon: <Shield size={18} />,
      },
      {
        question: '可以取消或更改行程吗？',
        answer: '我们理解计划可能有变：\n• 出发前60天以上：免费取消，全额退款\n• 出发前30-59天：收取10%手续费\n• 出发前15-29天：收取30%手续费\n• 出发前14天内：不可取消，但可转让\n\n行程更改视具体情况而定，我们会尽力协调。',
        icon: <Clock size={18} />,
      },
    ],
  },
  {
    title: '行程与体验',
    icon: <MapPin size={20} />,
    items: [
      {
        question: '行程中包含哪些服务？',
        answer: '标准行程包含：\n• 五星级或同等精品酒店住宿\n• 全程专车接送（含机场往返）\n• 每日精致早餐\n• 行程中标注的特色餐饮\n• 所有景点门票及体验活动\n• 旅行管家全程服务\n• 旅行保险\n\n机票通常不包含在基础价格中，但我们可为您安排。',
        icon: <Star size={18} />,
      },
      {
        question: '可以定制行程吗？',
        answer: '当然可以！我们的核心服务就是个性化定制。您可以：\n• 选择现有行程并调整细节\n• 完全从零开始定制专属行程\n• 增加特殊体验（如私人飞机、游艇、高尔夫等）\n• 根据特殊场合定制（蜜月、周年庆、生日等）\n\n请在预订时告诉我们您的需求，管家会为您量身打造。',
        icon: <Plane size={18} />,
      },
      {
        question: '行程中的自由时间多吗？',
        answer: '我们注重劳逸结合。典型行程安排：\n• 上午：精选体验活动（2-3小时）\n• 中午：特色餐厅午餐\n• 下午：自由活动或可选体验\n• 晚上：精心安排的晚餐或文化活动\n\n您可以随时选择跳过任何活动，享受属于自己的时光。',
        icon: <Clock size={18} />,
      },
    ],
  },
  {
    title: '安全与保障',
    icon: <Shield size={20} />,
    items: [
      {
        question: '旅行保险包含什么？',
        answer: '每位旅行者自动获得 comprehensive 旅行保险，包括：\n• 医疗费用保障（最高100万元）\n• 行程取消/中断保障\n• 行李延误/丢失保障\n• 紧急医疗撤离\n• 24小时全球紧急援助热线\n\n您也可以选择升级保险方案以获得更高保额。',
        icon: <Shield size={18} />,
      },
      {
        question: '遇到紧急情况怎么办？',
        answer: '我们提供全天候支持：\n• 旅行管家24小时可联系\n• 当地紧急联系人网络\n• 中文客服热线（+86 400-XXX-XXXX）\n• 紧急医疗撤离服务\n\n无论何时何地，您都不会独自面对困难。',
        icon: <Phone size={18} />,
      },
      {
        question: '你们如何保障服务质量？',
        answer: '我们通过多重机制确保服务品质：\n• 所有合作酒店/餐厅均经过实地考察\n• 旅行管家定期培训与考核\n• 每次行程后收集客户反馈\n• 不满意可申请服务补偿\n• 连续3年获得"中国高端旅行服务品牌"称号',
        icon: <Star size={18} />,
      },
    ],
  },
];

function AccordionItem({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <motion.div
      initial={false}
      className="border-b border-white/5 last:border-0"
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 py-5 px-6 text-left hover:bg-white/[0.02] transition-colors duration-300"
      >
        <span className="text-[#C9A96E]">{item.icon}</span>
        <span className="flex-1 text-[#F5F0EB] font-medium text-[0.95rem]">{item.question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: goldEase }}
        >
          <ChevronDown size={18} className="text-[#C9A96E]" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: goldEase }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5 pl-16">
              <p className="text-[#F5F0EB]/70 text-[0.9rem] leading-relaxed whitespace-pre-line">
                {item.answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (sectionIndex: number, itemIndex: number) => {
    const key = `${sectionIndex}-${itemIndex}`;
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] pt-24 pb-20">
      {/* Hero Section */}
      <div className="relative overflow-hidden mb-16">
        <div className="absolute inset-0 bg-gradient-to-b from-[#C9A96E]/5 to-transparent" />
        <div className="max-w-4xl mx-auto px-6 py-16 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: goldEase }}
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-px bg-[#C9A96E]/30" />
              <MessageCircle size={24} className="text-[#C9A96E]" />
              <div className="w-12 h-px bg-[#C9A96E]/30" />
            </div>
            <h1 className="font-['Playfair_Display'] text-4xl md:text-5xl text-[#F5F0EB] mb-4">
              常见问题
            </h1>
            <p className="text-[#F5F0EB]/60 text-lg max-w-2xl mx-auto">
              我们整理了旅行者最关心的问题，希望能帮助您更好地了解我们的服务
            </p>
          </motion.div>
        </div>
      </div>

      {/* FAQ Sections */}
      <div className="max-w-4xl mx-auto px-6">
        {faqSections.map((section, sectionIndex) => (
          <motion.div
            key={sectionIndex}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: sectionIndex * 0.1, ease: goldEase }}
            className="mb-10"
          >
            <div className="flex items-center gap-3 mb-5">
              <span className="text-[#C9A96E]">{section.icon}</span>
              <h2 className="font-['Playfair_Display'] text-xl text-[#F5F0EB]">
                {section.title}
              </h2>
              <div className="flex-1 h-px bg-[#C9A96E]/10" />
            </div>
            <div className="bg-white/[0.02] backdrop-blur-sm rounded-xl border border-white/[0.05] overflow-hidden">
              {section.items.map((item, itemIndex) => (
                <AccordionItem
                  key={itemIndex}
                  item={item}
                  isOpen={openItems[`${sectionIndex}-${itemIndex}`] || false}
                  onToggle={() => toggleItem(sectionIndex, itemIndex)}
                />
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Contact Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5, ease: goldEase }}
        className="max-w-4xl mx-auto px-6 mt-20"
      >
        <div className="bg-gradient-to-r from-[#C9A96E]/10 to-[#F5D99C]/10 rounded-2xl border border-[#C9A96E]/20 p-10 text-center">
          <h3 className="font-['Playfair_Display'] text-2xl text-[#F5F0EB] mb-4">
            还有其他问题？
          </h3>
          <p className="text-[#F5F0EB]/60 mb-8 max-w-lg mx-auto">
            我们的旅行管家随时准备为您解答任何疑问，并为您量身定制专属行程
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/booking"
              className="px-8 py-3.5 bg-[#C9A96E] text-[#0D0D0D] font-semibold rounded-lg hover:bg-[#F5D99C] transition-colors duration-300"
            >
              开始预订
            </Link>
            <a
              href="tel:+864000000000"
              className="px-8 py-3.5 border border-[#C9A96E]/30 text-[#C9A96E] font-semibold rounded-lg hover:bg-[#C9A96E]/10 transition-colors duration-300 flex items-center gap-2"
            >
              <Phone size={18} />
              致电咨询
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
