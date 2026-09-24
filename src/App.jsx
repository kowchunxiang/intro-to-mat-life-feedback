import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import logo from "./assets/images/logo.jpg";
import "./App.css";

const RATING_FIELDS = [
  "overall",
  "useful",
  "prepared",
  "clarity",
  "organization",
];

const INITIAL_FORM = {
  name: "",
  studentId: "",
  overall: 0,
  useful: 0,
  prepared: 0,
  clarity: 0,
  organization: 0,
  parts: [],
  liked: "",
  improve: "",
  future: "",
};

const CONTENT = {
  en: {
    councilName: "XMUM MAT Student Council",
    title: "Intro to MAT Life",
    subtitle: "Feedback",
    desc: "Help us make future MAT activities better.",
    about: "About you",
    optional: "Optional",
    required: "Required",
    name: "Name",
    studentId: "Student ID",
    namePlaceholder: "Enter your name",
    studentIdPlaceholder: "Enter your student ID",
    experience: "Your experience",
    overall: "How would you rate your overall experience?",
    useful: "How useful was the information shared today?",
    prepared: "Do you feel more confident about MAT life after this session?",
    clarity: "Was the content presented clearly and at a good pace?",
    organization: "How satisfied are you with the event organization?",
    ratingLabels: {
      overall: ["Poor", "Fair", "Average", "Good", "Excellent"],
      useful: [
        "Not helpful",
        "Slightly helpful",
        "Moderately helpful",
        "Very helpful",
        "Extremely helpful",
      ],
      prepared: ["Not at all", "Slightly", "Somewhat", "Mostly", "Very well"],
      clarity: ["Very unclear", "Unclear", "Neutral", "Clear", "Very clear"],
      organization: ["Very poor", "Poor", "Average", "Good", "Excellent"],
    },
    partsTitle: "Which sessions did you find useful?",
    parts: [
      "Curriculum Map & Career Path",
      "Study Skills & Time Management",
      "Learning Tools (LaTeX, AI)",
      "Math Software & Calculators",
      "MAT Study Group & Resources",
      "Senior Sharing & Future Planning",
    ],
    thoughts: "Your thoughts",
    liked: "What did you like most about the event?",
    improve: "What could we improve?",
    future: "What would you like to see next?",
    placeholderLiked: "Share your favorite part of the event…",
    placeholderImprove: "Tell us how we can do better…",
    placeholderFuture: "What activities would you like us to organize next?",
    submit: "Submit feedback",
    privacy:
      "Your feedback will only be used to improve future MAT activities.",
    thanks: "Thank you",
    thanksDesc: "Your feedback has been submitted.",
    again: "Submit another response",
    errorRating: "Please select a rating.",
    errorRequired: "This field is required.",
    errorSelect: "Please select at least one option.",
    followTitle: "Follow us",
    followDesc: "Stay updated with MAT activities and resources.",
    instagram: "Instagram",
    xiaohongshu: "Xiaohongshu",
  },

  zh: {
    councilName: "XMUM MAT 学生委员会",
    title: "Intro to MAT Life",
    subtitle: "活动反馈",
    desc: "帮助我们把未来的 MAT 活动做得更好。",
    about: "关于你",
    optional: "选填",
    required: "必填",
    name: "姓名",
    studentId: "学号",
    namePlaceholder: "输入姓名",
    studentIdPlaceholder: "输入学号",
    experience: "你的体验",
    overall: "你对本次活动的整体体验如何？",
    useful: "今天分享的信息对你有多大帮助？",
    prepared: "活动后，你是否对 MAT 学习生活更有信心？",
    clarity: "分享的内容是否清晰易懂，节奏合适？",
    organization: "你对本次活动的组织安排满意吗？",
    ratingLabels: {
      overall: ["很差", "较差", "一般", "较好", "很好"],
      useful: [
        "毫无帮助",
        "帮助甚微",
        "一般",
        "比较有帮助",
        "非常有帮助",
      ],
      prepared: [
        "完全没信心",
        "不太有信心",
        "一般",
        "比较有信心",
        "非常有信心",
      ],
      clarity: ["非常难懂", "比较难懂", "一般", "比较易懂", "非常易懂"],
      organization: ["非常差", "比较差", "一般", "比较好", "非常好"],
    },
    partsTitle: "哪些分享环节对你最有帮助？",
    parts: [
      "课程路线图与职业规划",
      "学习技巧与时间管理",
      "学习工具（LaTeX、AI 等）",
      "数学软件与实用工具",
      "MAT 学习小组与资源",
      "学长姐分享与未来规划",
    ],
    thoughts: "你的想法",
    liked: "你最喜欢本次活动的哪个部分？",
    improve: "有什么可以改进？",
    future: "未来你希望有什么活动？",
    placeholderLiked: "分享你最喜欢的活动环节…",
    placeholderImprove: "告诉我们如何做得更好…",
    placeholderFuture: "你希望我们下次举办什么活动？",
    submit: "提交反馈",
    privacy: "你的反馈只会用于改善未来的 MAT 活动。",
    thanks: "谢谢你",
    thanksDesc: "你的反馈已经成功提交。",
    again: "再提交一份",
    errorRating: "请为这道题选择一个评分。",
    errorRequired: "此项为必填项。",
    errorSelect: "请至少选择一项。",
    followTitle: "关注我们",
    followDesc: "获取 MAT 最新活动与资源。",
    instagram: "Instagram",
    xiaohongshu: "小红书",
  },
};

const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/xmum_math?stkn=dDYwMTg2aDZ0MGJw",
  xiaohongshu: "https://xhslink.cn/m/7mxiEobmMWb",
};

const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxkh_CLQuos5Bb5JqD9S2pj7EhRWgzIFEODpZ9MPf_IbS0xgK2opEfZPYQziHlUAFUM9g/exec";

function App() {
  const [lang, setLang] = useState("en");
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef(null);

  const t = CONTENT[lang];

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const togglePart = (index) => {
    const value = CONTENT.en.parts[index];

    setForm((prev) => ({
      ...prev,
      parts: prev.parts.includes(value)
        ? prev.parts.filter((x) => x !== value)
        : [...prev.parts, value],
    }));

    setErrors((prev) => {
      if (!prev.parts) return prev;
      const next = { ...prev };
      delete next.parts;
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    // 校验必填文本字段
    if (!form.name.trim()) newErrors.name = t.errorRequired;
    if (!form.studentId.trim()) newErrors.studentId = t.errorRequired;

    // 校验所有评分字段
    RATING_FIELDS.forEach((field) => {
      if (!form[field]) newErrors[field] = t.errorRating;
    });

    // 校验多选标签
    if (form.parts.length === 0) {
      newErrors.parts = t.errorSelect;
    }

    // 如果有错误，显示错误并滚动到第一个
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);

      const firstErrorKey = Object.keys(newErrors)[0];
      document
        .getElementById(`question-${firstErrorKey}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });

      return;
    }

    if (!formRef.current || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // 让截图从页面顶部开始，避免 sticky / scroll 位置影响 PDF。
      const previousScrollY = window.scrollY;
      window.scrollTo({ top: 0, behavior: "auto" });
      await new Promise((resolve) => requestAnimationFrame(resolve));

      const canvas = await html2canvas(formRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: getComputedStyle(document.body).backgroundColor,
        windowWidth: document.documentElement.scrollWidth,
      });

      window.scrollTo({ top: previousScrollY, behavior: "auto" });

      // JPEG 比 PNG 小很多，上传 Apps Script 会更稳定。
      const imageData = canvas.toDataURL("image/jpeg", 0.9);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imageWidth = pageWidth;
      const imageHeight = (canvas.height * imageWidth) / canvas.width;

      let heightLeft = imageHeight;
      let position = 0;

      pdf.addImage(
        imageData,
        "JPEG",
        0,
        position,
        imageWidth,
        imageHeight,
        undefined,
        "FAST"
      );

      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imageHeight;
        pdf.addPage();
        pdf.addImage(
          imageData,
          "JPEG",
          0,
          position,
          imageWidth,
          imageHeight,
          undefined,
          "FAST"
        );
        heightLeft -= pageHeight;
      }

      const pdfDataUri = pdf.output("datauristring");
      const pdfBase64 = pdfDataUri.split(",")[1];

      const studentIdentity =
        form.studentId.trim() || form.name.trim() || `anonymous_${Date.now()}`;

      const safeIdentity = studentIdentity
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .slice(0, 60);

      const fileName = `Intro_to_MAT_Life_${safeIdentity}_${Date.now()}.pdf`;

      const body = new URLSearchParams();
      body.append("pdf", pdfBase64);
      body.append("fileName", fileName);

      await fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        body: body.toString(),
      });

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Feedback upload failed:", error);
      alert(
        lang === "en"
          ? "Submission failed. Please try again."
          : "提交失败，请再试一次。"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm(INITIAL_FORM);
    setErrors({});
    setSubmitted(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (submitted) {
    return (
      <div className="successPage">
        <div className="backdrop" aria-hidden="true">
          <span className="glow glowA" />
          <span className="glow glowB" />
        </div>

        <div className="successCard">
          <div className="successLogoWrap">
            <img src={logo} alt="MAT Logo" className="successLogo" />
          </div>

          <div className="successIcon" aria-hidden="true">
            <svg viewBox="0 0 52 52" width="34" height="34">
              <path
                d="M14 27l8 8 16-16"
                fill="none"
                stroke="currentColor"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h1>{t.thanks}</h1>
          <p>{t.thanksDesc}</p>

          <SocialFollow t={t} />

          <button
            type="button"
            className="primaryButton"
            onClick={handleReset}
          >
            {t.again}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="backdrop" aria-hidden="true">
        <span className="glow glowA" />
        <span className="glow glowB" />
      </div>

      <nav className="navbar">
        <div className="navContent">
          <div className="brandMark">
            <img src={logo} alt="MAT Logo" className="brandLogo" />
            <span className="brandName">{t.councilName}</span>
          </div>

          <div className="segment" role="group" aria-label="Language">
            <button
              type="button"
              className={lang === "en" ? "active" : ""}
              aria-pressed={lang === "en"}
              onClick={() => setLang("en")}
            >
              English
            </button>

            <button
              type="button"
              className={lang === "zh" ? "active" : ""}
              aria-pressed={lang === "zh"}
              onClick={() => setLang("zh")}
            >
              中文
            </button>
          </div>
        </div>
      </nav>

      <main ref={formRef}>
        <header className="header">
          <div className="headerLogoWrap">
            <img src={logo} alt="MAT Logo" className="headerLogo" />
          </div>
          <p className="eyebrow">{t.title}</p>
          <h1>{t.subtitle}</h1>
          <p className="lede">{t.desc}</p>
        </header>

        <form onSubmit={handleSubmit} noValidate>
          <SectionTitle title={t.about} right={t.required} />

          <div className="card">
            <InputRow
              id="name"
              label={t.name}
              placeholder={t.namePlaceholder}
              value={form.name}
              error={errors.name}
              onChange={(v) => update("name", v)}
            />

            <InputRow
              id="studentId"
              label={t.studentId}
              placeholder={t.studentIdPlaceholder}
              value={form.studentId}
              error={errors.studentId}
              onChange={(v) => update("studentId", v)}
            />
          </div>

          <SectionTitle title={t.experience} right={t.required} />

          {RATING_FIELDS.map((field) => (
            <Question
              key={field}
              id={field}
              title={t[field]}
              error={errors[field]}
            >
              <Rating
                value={form[field]}
                onChange={(v) => update(field, v)}
                levels={t.ratingLabels[field]}
                invalid={Boolean(errors[field])}
              />
            </Question>
          ))}

          <Question id="parts" title={t.partsTitle} error={errors.parts}>
            <div className={errors.parts ? "chips hasError" : "chips"}>
              {t.parts.map((part, index) => {
                const selected = form.parts.includes(
                  CONTENT.en.parts[index]
                );

                return (
                  <button
                    type="button"
                    key={index}
                    className={selected ? "chip isSelected" : "chip"}
                    aria-pressed={selected}
                    onClick={() => togglePart(index)}
                  >
                    {part}
                  </button>
                );
              })}
            </div>
          </Question>

          <SectionTitle title={t.thoughts} right={t.optional} />

          <TextQuestion
            id="liked"
            title={t.liked}
            value={form.liked}
            placeholder={t.placeholderLiked}
            onChange={(v) => update("liked", v)}
          />

          <TextQuestion
            id="improve"
            title={t.improve}
            value={form.improve}
            placeholder={t.placeholderImprove}
            onChange={(v) => update("improve", v)}
          />

          <TextQuestion
            id="future"
            title={t.future}
            value={form.future}
            placeholder={t.placeholderFuture}
            onChange={(v) => update("future", v)}
          />

          <SectionTitle title={t.followTitle} />

          <SocialFollow t={t} />

          <div className="bottomArea">
            <button
              className="primaryButton"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? lang === "en"
                  ? "Submitting…"
                  : "提交中…"
                : t.submit}
            </button>

            <p className="privacy">{t.privacy}</p>
          </div>
        </form>
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function SectionTitle({ title, right }) {
  return (
    <div className="sectionTitle">
      <span>{title}</span>
      {right && <span className="sectionHint">{right}</span>}
    </div>
  );
}

function InputRow({ id, label, placeholder, value, error, onChange }) {
  return (
    <div
      id={`question-${id}`}
      className={error ? "inputRow hasError" : "inputRow"}
    >
      <label className="inputLabel" htmlFor={id}>
        {label}
      </label>

      <input
        id={id}
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />

      {error && <span className="inputError">{error}</span>}
    </div>
  );
}

function Question({ id, title, error, children }) {
  return (
    <section
      id={id ? `question-${id}` : undefined}
      className={error ? "question hasError" : "question"}
    >
      <h3>{title}</h3>

      {children}

      {error && <p className="errorText">{error}</p>}
    </section>
  );
}

function Rating({ value, onChange, levels, invalid }) {
  return (
    <div
      className={invalid ? "rating isInvalid" : "rating"}
      role="radiogroup"
    >
      <div className="ratingScale">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={String(n)}
            className={value === n ? "ratingButton isActive" : "ratingButton"}
            onClick={() => onChange(n)}
          >
            {n}
          </button>
        ))}
      </div>

      <div className="ratingResult">
        {value > 0 ? (
          <span className="ratingText">{levels[value - 1]}</span>
        ) : (
          <span className="ratingText placeholder">&nbsp;</span>
        )}
      </div>
    </div>
  );
}

function TextQuestion({ id, title, value, placeholder, onChange }) {
  return (
    <div id={`question-${id}`} className="question textQuestion">
      <h3>{title}</h3>

      <textarea
        value={value}
        placeholder={placeholder}
        maxLength={500}
        onChange={(e) => onChange(e.target.value)}
      />

      <div className="charCount">
        {value.length} / 500
      </div>
    </div>
  );
}

function SocialFollow({ t }) {
  return (
    <div className="socialCard">
      <p className="socialDesc">{t.followDesc}</p>

      <div className="socialLinks">
        <a
          className="socialLink"
          href={SOCIAL_LINKS.instagram}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
        >
          <span className="socialIcon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
          </span>
          <span className="socialLabel">{t.instagram}</span>
          <span className="socialChevron" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </span>
        </a>

        <a
          className="socialLink"
          href={SOCIAL_LINKS.xiaohongshu}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Xiaohongshu"
        >
          <span className="socialIcon socialIconXhs" aria-hidden="true">
            <svg viewBox="0 0 48 48" width="20" height="20">
              <rect width="37" height="37" x="5.5" y="5.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" rx="4" ry="4" strokeWidth="3" />
              <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M32.254 19.374v9.252m-5.781-7.776v7.776M24.95 20.85h3.047m-4.038 7.776h4.803m1.599-7.776h4.13c.49 0 .885.396.885.885v2.696" />
              <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M29.815 29.514v3.047m-5.781-3.047v3.047m-5.782-3.047v3.047m-5.781-3.047v3.047m23.125 0H15.108" />
            </svg>
          </span>
          <span className="socialLabel">{t.xiaohongshu}</span>
          <span className="socialChevron" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </span>
        </a>
      </div>
    </div>
  );
}

export default App;