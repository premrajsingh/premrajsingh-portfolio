/**
 * Source of truth: public/Prem_Raj_Resume.pdf (Prem Raj CV).
 * Every string below is traceable to a resume line or a resume hyperlink annotation.
 * Never invent employers, clients, metrics, dates, outcomes, or URLs.
 *
 * Known resume inconsistency (left as-is here, flagged to the author):
 * the Summary says "250+ DSA problems" while the Competitive Programming
 * section says "300+ problems". This file follows the more specific
 * Competitive Programming line (300+).
 */

export const SITE = {
  name: "Prem Raj",
  role: "AI Software Developer",
  roleLong: "AI Software Developer",
  title: "Prem Raj — AI Software Developer",
  description:
    "Prem Raj — AI Software Developer. Backend systems and AI pipelines: knowledge-graph RAG, multi-agent services, event-driven integrations. Final-year B.Tech IT, GGSIPU New Delhi.",
  location: "New Delhi, India",
  email: "singhpremraj264@gmail.com",
  phone: "+91 7726960080",
  phoneHref: "tel:+917726960080",
  resume: "/Prem_Raj_Resume.pdf",
  github: "https://github.com/premrajsingh",
  githubHandle: "github.com/premrajsingh",
  /** Resume link annotation resolves to the full LinkedIn slug; the resume displays the short handle. */
  linkedin: "https://www.linkedin.com/in/prem-raj-08065539a/",
  linkedinHandle: "linkedin.com/in/prem-raj",
  portfolio: "https://premrajsingh-portfolio.vercel.app/",
  education: {
    degree: "B.Tech – Information Technology",
    school: "Bhagwan Parshuram Institute of Technology, GGSIPU, New Delhi",
    years: "2023 – 2027",
    cgpa: "8.0",
  },
}

export const NAV = [
  { id: "about", label: "About", index: "01" },
  { id: "experience", label: "Experience", index: "02" },
  { id: "work", label: "Work", index: "03" },
  { id: "skills", label: "Skills", index: "04" },
  { id: "credentials", label: "Credentials", index: "05" },
  { id: "contact", label: "Contact", index: "06" },
]

export const HERO = {
  available: true,
  /** Every noun traces to a resume line: Droot KG-RAG (LangChain, Neo4j, Pinecone), AI Project
   *  Estimator (FastAPI multi-agent), Skills: Event-Driven Architecture / Webhooks / Socket.IO,
   *  Dasgupta Maiti production platform. */
  lede: "I design backend systems and AI pipelines — RAG over knowledge graphs, multi-agent services, event-driven integrations — and ship them to production.",
  /** Four capability cells; each detail is a verbatim skill or project tech item. */
  specPlate: [
    { index: "01", title: "Knowledge-graph RAG", detail: "LangChain · Neo4j · Pinecone" },
    { index: "02", title: "Multi-agent systems", detail: "FastAPI · Gemini AI" },
    {
      index: "03",
      title: "Event-driven integrations",
      detail: "WhatsApp Cloud API · Webhooks · Socket.IO",
    },
    { index: "04", title: "Production", detail: "MERN platform · 100+ users · 99%+ uptime" },
  ],
  /** Counts are appended at render time from src/three/architecture.js. */
  figureCaption:
    "Fig. 0 — Reference architecture. Composite of components from shipped work (Slnko Energy RAG, AI Project Estimator, Dasgupta Maiti portal, Yashoda Bhawan).",
  stats: [
    { value: "300+", label: "DSA problems" },
    { value: "8.0", label: "CGPA" },
    { value: "2027", label: "Graduating" },
    { value: "2", label: "Freelance clients" },
  ],
}

/**
 * `featured: true` = the work is documented on the resume (Projects section, or the
 * Freelance experience client blocks). `featured: false` = real public repos that
 * are not on the resume; surfaced separately so nothing implies resume backing.
 */
export const PROJECTS = [
  {
    num: "01",
    title: "AI Project Estimator",
    type: "AI/ML · Full Stack",
    featured: true,
    tech: [
      "FastAPI",
      "React",
      "Gemini AI",
      "GitPython",
      "Recharts",
      "MongoDB Atlas",
      "Multi-Agent",
    ],
    desc: "Multi-agent AI estimation platform built with FastAPI and Gemini AI, including a Repo Intelligence module that analyses GitHub repositories through GitPython. Generates automated cost, timeline, risk, and architecture reports over MongoDB Atlas APIs with a Recharts dashboard for estimation comparison.",
    imgs: [
      "/photos/ai-estimator-main.png",
      "/photos/ai-estimator-sub1.png",
      "/photos/ai-estimator-sub2.png",
    ],
    /** Resume Projects row: "Live" annotation. */
    live: "https://software-cost-esstimator-frontend.vercel.app/",
    github: "https://github.com/premrajsingh/AI-Project-Estimator",
  },
  {
    num: "02",
    title: "Dasgupta Maiti Portal",
    type: "MERN · Freelance",
    featured: true,
    tech: ["React", "Node.js", "Express", "MongoDB", "JWT", "Zoho OAuth2", "Cloudinary", "cPanel"],
    desc: "Production MERN platform delivered for Dasgupta Maiti & Associates, Kolkata, serving 100+ users — JWT/Bcrypt RBAC, Zoho OAuth2 mail, Cloudinary CDN, a multi-collection search engine, and react-helmet-async SEO with XML sitemaps. Custom deploy_prep.sh CI/CD pipeline for one-click cPanel builds, plus SSL and DNS (MX, SPF, DKIM) configuration, achieving 99%+ uptime.",
    imgs: ["/photos/dasgupta-main.png", "/photos/dasgupta-sub1.png", "/photos/dasgupta-sub2.png"],
    /** Resume Experience block: "Live" annotation. */
    live: "https://dasguptamaitiassociates.com/",
    /** Public repo; the resume does not attach a Code link to this client. */
    github: "https://github.com/premrajsingh/CAweb",
  },
  {
    num: "03",
    title: "Yashoda Bhawan System",
    type: "Full Stack · Freelance",
    featured: true,
    tech: [
      "React",
      "TypeScript",
      "Vite",
      "Tailwind CSS",
      "Node.js",
      "Express",
      "MySQL",
      "Sequelize",
      "Cloudinary",
    ],
    desc: "Full-stack hostel management system for Yashoda Bhawan, Jharkhand. Student and administrator dashboards cover registration, room allocation, attendance, events, gallery management, payments, and administrative operations — with JWT authentication, RBAC, OTP email verification, password recovery, administrator approval workflows, invoice generation, and encrypted student information.",
    imgs: ["/photos/yashoda-main.png", "/photos/yashoda-sub1.png", "/photos/yashoda-sub2.png"],
    /** Resume Experience block: "Live" annotation. */
    live: "https://yashodabhawan.in/",
    github: null,
  },
  {
    num: "04",
    title: "Automated Bank Statement Processing",
    type: "Python · Automation",
    featured: true,
    tech: [
      "Python",
      "Gmail API",
      "PyPDF",
      "BeautifulSoup4",
      "CustomTkinter",
      "PyInstaller",
      "macOS launchd",
    ],
    desc: "Automated bank statement processing for 10+ banks, reducing manual effort by 90–95% through PDF extraction, classification, and workflow automation. Implements SHA-256 duplicate detection and ships as a standalone desktop application with a macOS launchd monitoring daemon.",
    imgs: [],
    live: null,
    github: "https://github.com/premrajsingh/Automated-Bank-Statement-Processing-System",
  },
  {
    num: "05",
    title: "Studify Hub",
    type: "Full Stack",
    featured: true,
    tech: ["JavaScript", "Bootstrap 5", "CodeMirror", "Groq API", "Web Speech API"],
    desc: "Student productivity platform with a seven-language CodeMirror editor, Groq AI assistant, code executor, translator, chat history, and Web Speech API text-to-speech.",
    imgs: ["/photos/studify-main.png", "/photos/studify-sub1.png", "/photos/studify-sub2.png"],
    live: "https://premrajsingh.github.io/StudifyHub/",
    github: "https://github.com/premrajsingh/StudifyHub",
  },
  {
    num: "06",
    title: "Spotify Web Clone",
    type: "Frontend",
    featured: false,
    tech: ["HTML5", "CSS3", "Vanilla JavaScript", "DOM Manipulation"],
    desc: "Spotify web player clone with music playback, playlist rendering, and a responsive UI built with vanilla web technologies.",
    imgs: ["/photos/spotify-main.png", "/photos/spotify-sub1.png", "/photos/spotify-sub2.png"],
    live: "https://premrajsingh.github.io/spotify/",
    github: "https://github.com/premrajsingh/spotify",
  },
  {
    num: "07",
    title: "CRUD Application",
    type: "Backend",
    featured: false,
    tech: ["Node.js", "Express.js", "MongoDB", "Mongoose"],
    desc: "RESTful CRUD application with persistent MongoDB storage.",
    imgs: [],
    /** Previous Render deploy no longer responds; code only until redeployed. */
    live: null,
    github: "https://github.com/premrajsingh/crud-operation",
  },
]

export const EXPERIENCE = [
  {
    role: "AI Engineer Intern",
    company: "Plancover",
    companyUrl: null,
    place: "Gurgaon",
    period: "Oct 2026 – Present",
    badge: "Internship",
    /** No bullet points exist yet; the card renders header-only (no placeholder prose). */
    points: [],
  },
  {
    role: "Tech Intern",
    company: "Droot Private Limited",
    companyUrl: "https://www.droot.com/",
    affiliation: "Slnko Energy Pvt. Ltd.",
    affiliationUrl: "https://www.slnkoenergy.com/",
    place: "Noida",
    period: "Jul 2026 – Sep 2026",
    badge: "Internship",
    points: [
      "Designed a Knowledge Graph-augmented RAG system for Slnko Energy using LangChain, Neo4j, Pinecone, and LLMs for graph-aware semantic search, contextual retrieval, and intelligent AI responses",
      "Developed WhatsApp Business integration for Slnko Energy Pvt. Ltd. with Meta Business API and WhatsApp Cloud API using secure webhooks for receiving, processing, and responding to customer messages",
      "Implemented webhook-based interaction workflows, message event handling, API authentication, delivery-status tracking, and integration with internal business systems",
      "Worked with REST APIs, Socket.IO, cloud deployment, SSH-based server management, Jest testing, and Playwright end-to-end testing",
    ],
    /** Hero-diagram node ids named in the bullets above (src/three/architecture.js). */
    stack: ["rag", "neo4j", "pinecone", "llm", "webhook", "socket", "node-api"],
  },
  {
    role: "Freelance Full-Stack Developer",
    company: null,
    period: "Nov 2025 – Jan 2026",
    badge: "Freelance",
    points: [],
    /** The resume breaks this role into two named client blocks; preserved verbatim. */
    clients: [
      {
        name: "Dasgupta Maiti & Associates, Kolkata",
        url: "https://dasguptamaitiassociates.com/",
        points: [
          "Delivered production MERN platform for 100+ users: JWT/Bcrypt RBAC, Zoho OAuth2 mail, Cloudinary CDN, multi-collection search engine, and react-helmet-async SEO with XML sitemaps",
          "Built custom deploy_prep.sh CI/CD pipeline for one-click cPanel builds; configured SSL, DNS (MX, SPF, DKIM), and pdf-parse data migration — achieving 99%+ uptime",
        ],
      },
      {
        name: "Yashoda Bhawan, Jharkhand",
        url: "https://yashodabhawan.in/",
        points: [
          "Built a full-stack hostel management system using React, TypeScript, Vite, Tailwind CSS, Node.js, Express, MySQL, Sequelize, and Cloudinary",
          "Developed student and administrator dashboards for registration, room allocation, attendance, events, gallery management, payments, and administrative operations",
          "Implemented JWT authentication, RBAC, OTP email verification, password recovery, administrator approval workflows, invoice generation, and encrypted student information",
        ],
      },
    ],
    stills: [
      {
        src: "/photos/dasgupta-main.png",
        alt: "Dasgupta Maiti portal interface",
        caption: "Dasgupta Maiti & Associates",
      },
      {
        src: "/photos/yashoda-main.png",
        alt: "Yashoda Bhawan system interface",
        caption: "Yashoda Bhawan",
      },
    ],
    stack: ["client", "node-api", "mongo", "mysql"],
  },
  {
    role: "Frontend Developer Intern",
    company: "Coding Bits",
    period: "June 2025 – July 2025",
    badge: "Internship",
    points: [
      "Built reusable React component library used across 3+ features",
      "Delivered all sprints on time in Agile/Scrum with consistent peer code reviews",
    ],
    stack: ["client"],
  },
]

/** Resume section: Competitive Programming. */
export const COMPETITIVE = {
  count: "300+",
  platforms: "LeetCode & GeeksforGeeks",
  topics: [
    "Arrays",
    "Trees",
    "Recursion",
    "Sliding Window",
    "Greedy Algorithms",
    "Dynamic Programming",
  ],
}

/**
 * Resume section: Certifications & Leadership.
 * `certificatesUrl` is the "All Certificates" link annotation on the resume.
 */
export const CERTIFICATIONS = {
  certificatesUrl:
    "https://drive.google.com/drive/folders/1VT12PmTj8sixmOoESif1wx1UYwtLpss7?usp=sharing",
  items: [
    { title: "Full Stack AI Engineer 2026 – Generative AI & LLMs", issuer: "Udemy" },
    { title: "Professional Certificate in DevOps", issuer: "Udemy" },
    { title: "Java DSA + LeetCode Exercises", issuer: "Udemy" },
    { title: "Full-Stack E-Commerce (Spring Boot & React)", issuer: "Udemy" },
    { title: "CSS, JS, Bootstrap, Java & C++", issuer: "Udemy" },
  ],
  leadership: {
    title: "NSS Volunteer",
    detail: "Community development programs, event organization & leadership",
  },
}

/**
 * Resume section: Hackathons. The resume lists participation only — it states no
 * placement or result, so none is claimed here.
 */
export const HACKATHONS = {
  certificatesUrl:
    "https://drive.google.com/drive/folders/1Spuv1p6qhui2ftgrCOCnQK-u1WZ-MYNS?usp=sharing",
  items: [
    { title: "HackHazards 2025", team: "Team Codesync", img: "/photos/hackhazards-cert.png" },
    { title: "Adobe India Hackathon", team: "Team Codesync", img: null },
    { title: "GDG Solution Challenge", team: null, img: null },
    { title: "L&T Createch 2026", team: null, img: "/photos/createch-cert.png" },
  ],
}

export const SKILLS = [
  {
    title: "Languages",
    items: ["JavaScript (ES6+)", "Python", "C++", "Java"],
  },
  {
    title: "Frontend",
    proof: {
      src: "/photos/studify-main.png",
      alt: "Studify Hub interface",
      caption: "Studify Hub",
    },
    items: [
      "React.js",
      "React Native",
      "Redux Toolkit",
      "HTML5",
      "CSS3",
      "Tailwind CSS",
      "Bootstrap",
      "Vite",
    ],
  },
  {
    title: "Backend",
    proof: {
      src: "/photos/yashoda-sub1.png",
      alt: "Yashoda Bhawan system interface",
      caption: "Yashoda Bhawan System",
    },
    items: [
      "Node.js",
      "Express.js",
      "FastAPI",
      "REST APIs",
      "MVC Architecture",
      "Async Programming",
    ],
  },
  {
    title: "Databases",
    items: ["MongoDB", "MongoDB Atlas", "MySQL", "Redis", "Neo4j", "Pinecone"],
  },
  {
    title: "AI",
    proof: {
      src: "/photos/ai-estimator-main.png",
      alt: "AI Project Estimator dashboard",
      caption: "AI Project Estimator",
    },
    items: [
      "RAG Pipelines",
      "LangChain",
      "LLMs",
      "Multi-Agent Systems",
      "Prompt Engineering",
      "Generative AI",
      "MCP",
    ],
  },
  {
    title: "Messaging",
    items: ["Apache Kafka", "Redis Pub/Sub", "Event-Driven Architecture", "Message Queues"],
  },
  {
    title: "Integrations",
    items: [
      "WhatsApp Business API (WABA)",
      "Meta Business API",
      "WhatsApp Cloud API",
      "Webhooks",
      "WebSocket",
      "Socket.IO",
      "Bulk Messaging",
    ],
  },
  {
    title: "Security",
    items: ["JWT", "Bcrypt", "RBAC", "OAuth2", "Helmet.js", "API Authentication"],
  },
  {
    title: "Testing",
    items: ["Jest", "Playwright", "Vitest", "E2E Testing", "Integration Testing", "API Testing"],
  },
  {
    title: "DevOps",
    items: [
      "Docker",
      "Kubernetes",
      "Git/GitHub",
      "SSH",
      "Linux",
      "Bash",
      "CI/CD",
      "AWS",
      "Vercel",
      "Render",
      "cPanel",
    ],
  },
  {
    title: "Tools",
    items: ["Postman", "VS Code", "GitHub Copilot", "Claude", "Cursor", "Codex"],
  },
  {
    title: "Core CS",
    items: [
      "Data Structures & Algorithms",
      "OOP",
      "DBMS",
      "OS",
      "Computer Networks",
      "System Design",
    ],
  },
]

export const ABOUT = {
  /** Paraphrase of the resume Summary + Education lines only. */
  bio: "I'm Prem Raj, a final-year B.Tech Information Technology student at Bhagwan Parshuram Institute of Technology, GGSIPU, graduating in 2027. I design and build backend systems and AI applications — knowledge-graph RAG pipelines, multi-agent services and event-driven integrations — and have shipped production full-stack platforms for real clients with React, Node.js, Express, FastAPI, MongoDB and MySQL.",
  photo: "/photos/profile-professional.jpg",
  photoFallback: "/photos/hero.jpg",
  timeline: [
    { year: "2023", label: "Started B.Tech IT", place: "BPIT, GGSIPU, New Delhi" },
    { year: "Jun 2025", label: "Frontend Developer Intern", place: "Coding Bits" },
    {
      year: "Nov 2025",
      label: "Freelance Full-Stack Developer",
      place: "Dasgupta Maiti & Associates · Yashoda Bhawan",
    },
    {
      year: "Jul 2026",
      label: "Tech Intern (Jul – Sep 2026)",
      place: "Droot / Slnko Energy, Noida",
    },
    { year: "Oct 2026", label: "AI Engineer Intern", place: "Plancover, Gurgaon" },
  ],
  chips: ["New Delhi, India", "GGSIPU · CGPA 8.0", "Graduating 2027", "300+ DSA problems"],
}
