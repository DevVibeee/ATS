import { Job, User, JobApplication, ParsedResume, NotificationMessage } from '../types';

export const SAMPLE_STUDENT_RESUME: ParsedResume = {
  id: 'res_alex_01',
  fileName: 'Alex_Morgan_FullStack_Resume.pdf',
  uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  rawText: `ALEX MORGAN
San Francisco, CA | alex.morgan@email.com | +1 (555) 234-5678 | github.com/alexmorgan

SUMMARY
Results-driven Full Stack Engineer with 3+ years of experience building scalable web applications, microservices, and interactive UI systems. Proficient in React, TypeScript, Node.js, Express, PostgreSQL, and Tailwind CSS. Demonstrated ability in optimizing database query performance by 40% and deploying CI/CD pipelines on Docker.

SKILLS
- Technical: React.js, TypeScript, JavaScript (ES6+), Node.js, Express.js, PostgreSQL, REST APIs, GraphQL, HTML5/CSS3, Tailwind CSS, Jest
- Tools & Cloud: Git, GitHub Actions, Docker, Webpack, Vite, Postman, Vercel
- Soft Skills: Agile/Scrum Collaboration, Cross-functional Communication, Problem Solving, Code Review
- Certifications: AWS Certified Developer Associate, Meta Front-End Developer Certificate

WORK EXPERIENCE
Full Stack Web Developer | NexaTech Solutions | June 2023 - Present
- Architected and delivered a real-time analytics dashboard serving 50k+ daily active users using React, TypeScript, and WebSockets.
- Redesigned PostgreSQL schema and implemented indexed queries, reducing API response latency by 42%.
- Integrated RESTful endpoints and OAuth2 authentication flows using Node.js and Express.

Junior Frontend Developer | CloudPulse Media | May 2022 - May 2023
- Built 15+ accessible, responsive UI components using Tailwind CSS and Framer Motion.
- Collaborated with UX designers to translate Figma mockups into production-ready code with 98% design fidelity.

EDUCATION
Bachelor of Science in Computer Science
University of California, Berkeley | 2018 - 2022 | GPA: 3.8/4.0
`,
  fullName: 'Alex Morgan',
  email: 'alex.morgan@email.com',
  phone: '+1 (555) 234-5678',
  summary: 'Results-driven Full Stack Engineer with 3+ years of experience building scalable web applications using React, TypeScript, Node.js, Express, and PostgreSQL.',
  extractedSkills: {
    technical: ['React.js', 'TypeScript', 'JavaScript', 'Node.js', 'Express.js', 'PostgreSQL', 'REST APIs', 'GraphQL', 'Tailwind CSS', 'HTML5/CSS3', 'Jest'],
    soft: ['Agile/Scrum', 'Cross-functional Communication', 'Problem Solving', 'Code Review'],
    tools: ['Git', 'GitHub Actions', 'Docker', 'Vite', 'Postman', 'Vercel'],
    certifications: ['AWS Certified Developer Associate', 'Meta Front-End Developer Certificate'],
  },
  workExperience: [
    {
      company: 'NexaTech Solutions',
      role: 'Full Stack Web Developer',
      startDate: '2023-06',
      endDate: 'Present',
      current: true,
      highlights: [
        'Architected real-time analytics dashboard serving 50k+ DAU using React, TypeScript, and WebSockets.',
        'Redesigned PostgreSQL schema and implemented indexed queries, reducing API response latency by 42%.',
        'Integrated RESTful endpoints and OAuth2 authentication flows using Node.js and Express.',
      ],
    },
    {
      company: 'CloudPulse Media',
      role: 'Junior Frontend Developer',
      startDate: '2022-05',
      endDate: '2023-05',
      current: false,
      highlights: [
        'Built 15+ accessible, responsive UI components using Tailwind CSS and Framer Motion.',
        'Collaborated with UX designers to translate Figma mockups into production-ready code.',
      ],
    },
  ],
  education: [
    {
      institution: 'University of California, Berkeley',
      degree: 'Bachelor of Science',
      fieldOfStudy: 'Computer Science',
      startYear: '2018',
      endYear: '2022',
      grade: '3.8 GPA',
    },
  ],
  atsHealthScore: 92,
  formattingIssues: ['Minor: Bullet points could include additional business revenue impact metrics.'],
  strengths: [
    'Excellent skill taxonomy and clear tech stack separation',
    'Quantifiable engineering metrics (% latency reduction, DAU size)',
    'Strong balance of technical, tool, and cloud certifications',
  ],
  improvements: [
    'Add specific CI/CD automation metrics or cloud deployment details if applying for DevOps roles.',
  ],
  keywordVector: [
    'TypeScript', 'React', 'Node.js', 'Express', 'PostgreSQL', 'REST API', 'GraphQL',
    'Tailwind CSS', 'Docker', 'Git', 'Agile', 'AWS', 'WebSockets', 'Jest', 'Figma'
  ],
};

export const RESUME_ELENA_ROSTOVA: ParsedResume = {
  id: 'res_elena_03',
  fileName: 'Elena_Rostova_Resume.pdf',
  uploadedAt: '2026-07-20T14:20:00Z',
  rawText: 'Elena Rostova - 4 years exp in Python, FastAPI, React, TypeScript, Gemini/OpenAI API, Vector Search, PyTorch, Docker.',
  fullName: 'Elena Rostova',
  email: 'elena.rostova@ai.io',
  phone: '+1 (555) 456-7890',
  summary: 'AI Specialist with deep hands-on expertise in LLMs, fine-tuning, Python FastAPI microservices, and React interfaces.',
  extractedSkills: {
    technical: ['Python', 'FastAPI', 'React', 'TypeScript', 'LLM / Gemini API', 'Vector DB', 'PyTorch', 'Tailwind CSS'],
    soft: ['Research', 'Product Innovation'],
    tools: ['Docker', 'LangChain', 'Git'],
    certifications: ['DeepLearning.AI TensorFlow Professional'],
  },
  workExperience: [
    {
      company: 'Cognitive Dynamics',
      role: 'AI Software Engineer',
      startDate: '2022-08',
      endDate: 'Present',
      current: true,
      highlights: ['Deployed LLM RAG pipelines using Gemini API and Pinecone vector database.'],
    },
  ],
  education: [
    {
      institution: 'MIT',
      degree: 'BS in Artificial Intelligence',
      fieldOfStudy: 'Computer Science & AI',
      startYear: '2018',
      endYear: '2022',
    },
  ],
  atsHealthScore: 94,
  formattingIssues: [],
  strengths: ['Direct match for AI Application Specialist role'],
  improvements: [],
  keywordVector: ['Python', 'FastAPI', 'React', 'TypeScript', 'LLM / Gemini API', 'Vector DB', 'Docker'],
};

export const RESUME_DAVID_CHEN: ParsedResume = {
  id: 'res_david_04',
  fileName: 'David_Chen_WebDev.pdf',
  uploadedAt: '2026-07-19T16:45:00Z',
  rawText: 'David Chen - Junior Frontend Dev with HTML, CSS, JavaScript, React, Tailwind CSS, Git.',
  fullName: 'David Chen',
  email: 'david.chen@frontend.dev',
  phone: '+1 (555) 321-6549',
  summary: 'Junior Frontend Developer eager to build clean React components.',
  extractedSkills: {
    technical: ['React', 'JavaScript', 'HTML5/CSS3', 'Tailwind CSS'],
    soft: ['Enthusiastic', 'Quick Learner'],
    tools: ['Git', 'VS Code'],
    certifications: [],
  },
  workExperience: [
    {
      company: 'Pixel Design Agency',
      role: 'Junior Web Developer',
      startDate: '2023-01',
      endDate: 'Present',
      current: true,
      highlights: ['Built responsive marketing landing pages with HTML, CSS, React.'],
    },
  ],
  education: [
    {
      institution: 'Community College',
      degree: 'Associate Degree',
      fieldOfStudy: 'Web Development',
      startYear: '2020',
      endYear: '2022',
    },
  ],
  atsHealthScore: 78,
  formattingIssues: ['Missing TypeScript expertise and backend Node.js experience'],
  strengths: ['Solid foundation in HTML/CSS and basic React'],
  improvements: ['Learn TypeScript, Node.js, and Express to reach 80%+ threshold for Full Stack roles'],
  keywordVector: ['React', 'JavaScript', 'HTML', 'CSS', 'Tailwind CSS'],
};

export const MOCK_STUDENT_USER: User = {
  id: 'usr_student_01',
  name: 'Alex Morgan',
  email: 'alex.morgan@email.com',
  role: 'student',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  studentProfile: {
    headline: 'Full Stack Engineer & Web Systems Specialist',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA',
    bio: 'Passionate about building fast, scalable web apps and AI integrations. Always eager to master cutting-edge modern frontend and backend architectures.',
    experienceYears: 3,
    desiredRole: 'Full Stack / Frontend Software Engineer',
    portfolioUrl: 'https://github.com/alexmorgan',
    skills: ['TypeScript', 'React', 'Node.js', 'Express', 'PostgreSQL', 'Tailwind CSS', 'Docker', 'GraphQL', 'AWS'],
    education: [
      {
        institution: 'UC Berkeley',
        degree: 'BS in Computer Science',
        fieldOfStudy: 'Computer Science',
        startYear: '2018',
        endYear: '2022',
        grade: '3.8 GPA',
      },
    ],
    workHistory: SAMPLE_STUDENT_RESUME.workExperience,
    resume: SAMPLE_STUDENT_RESUME,
  },
};

export const SAMPLE_PRESET_STUDENT_USERS: User[] = [
  MOCK_STUDENT_USER,
  {
    id: 'usr_cand_03',
    name: 'Elena Rostova',
    email: 'elena.rostova@ai.io',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    studentProfile: {
      headline: 'AI Product Developer & Python Specialist',
      phone: '+1 (555) 456-7890',
      location: 'Boston, MA',
      bio: 'AI Specialist with deep hands-on expertise in LLMs, fine-tuning, Python FastAPI microservices, and React interfaces.',
      experienceYears: 4,
      desiredRole: 'AI / ML Web Application Specialist',
      portfolioUrl: 'https://github.com/elenarostova-ai',
      skills: ['Python', 'FastAPI', 'React', 'TypeScript', 'LLM / Gemini API', 'Vector DB', 'PyTorch', 'Tailwind CSS'],
      education: [
        {
          institution: 'MIT',
          degree: 'BS in Artificial Intelligence',
          fieldOfStudy: 'Computer Science & AI',
          startYear: '2018',
          endYear: '2022',
        },
      ],
      workHistory: RESUME_ELENA_ROSTOVA.workExperience,
      resume: RESUME_ELENA_ROSTOVA,
    },
  },
  {
    id: 'usr_cand_04',
    name: 'David Chen',
    email: 'david.chen@frontend.dev',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    studentProfile: {
      headline: 'Junior Web Developer (1.5 yrs exp)',
      phone: '+1 (555) 321-6549',
      location: 'Austin, TX',
      bio: 'Junior Frontend Developer eager to build clean React components and bridge skills toward full stack engineering.',
      experienceYears: 1.5,
      desiredRole: 'Frontend Developer',
      portfolioUrl: 'https://davidchen.dev',
      skills: ['React', 'JavaScript', 'HTML5/CSS3', 'Tailwind CSS', 'Git'],
      education: [
        {
          institution: 'Community College',
          degree: 'Associate Degree',
          fieldOfStudy: 'Web Development',
          startYear: '2020',
          endYear: '2022',
        },
      ],
      workHistory: RESUME_DAVID_CHEN.workExperience,
      resume: RESUME_DAVID_CHEN,
    },
  },
];

export const MOCK_RECRUITER_USER: User = {
  id: 'usr_recruiter_01',
  name: 'Sarah Jenkins',
  email: 'sarah.j@techforge.io',
  role: 'recruiter',
  avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  recruiterProfile: {
    companyName: 'TechForge Systems',
    companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
    industry: 'Enterprise SaaS & Cloud Infrastructure',
    companySize: '250-500 employees',
    location: 'San Francisco, CA (Hybrid)',
    website: 'https://techforge.io',
    description: 'TechForge is a high-growth cloud SaaS platform delivering next-generation AI developer tools and real-time observability engines for global engineering teams.',
  },
};

export const INITIAL_JOBS: Job[] = [
  {
    id: 'job_01',
    recruiterId: 'usr_recruiter_01',
    companyName: 'TechForge Systems',
    companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
    title: 'Senior Full Stack Engineer (React + Node)',
    department: 'Core Engineering',
    location: 'San Francisco, CA',
    locationType: 'Hybrid',
    employmentType: 'Full-Time',
    experienceLevel: 'Mid-level',
    salaryRange: '$135,000 - $165,000 / year',
    description: `We are looking for a Senior Full Stack Engineer to join our Core SaaS team. You will lead the development of our flagship cloud dashboard, architect resilient Node.js backends, and collaborate with product teams to roll out high-impact developer features.

Responsibilities:
- Build modular React micro-frontends with TypeScript and Tailwind CSS.
- Design performant REST & GraphQL APIs in Node.js/Express.
- Optimize PostgreSQL database queries and handle real-time WebSockets state.
- Ensure automated testing with Jest and seamless Docker containerization.`,
    requiredSkills: ['React', 'TypeScript', 'Node.js', 'Express', 'PostgreSQL', 'Tailwind CSS'],
    niceToHaveSkills: ['GraphQL', 'Docker', 'AWS', 'Jest', 'WebSockets'],
    minExperienceYears: 3,
    postedDate: '2026-07-20',
    status: 'Active',
  },
  {
    id: 'job_02',
    recruiterId: 'usr_recruiter_01',
    companyName: 'TechForge Systems',
    companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
    title: 'AI / ML Web Application Specialist',
    department: 'Applied AI',
    location: 'Remote',
    locationType: 'Remote',
    employmentType: 'Full-Time',
    experienceLevel: 'Senior',
    salaryRange: '$150,000 - $185,000 / year',
    description: `TechForge Applied AI team is seeking an engineer passionate about marrying LLMs, Python AI pipelines, and responsive TypeScript UI products.

Responsibilities:
- Integrate Gemini and OpenAI API services into interactive web products.
- Build Python FastAPI backends and vector search pipelines (Pinecone/Milvus).
- Implement responsive React dashboards for AI workflow orchestration.`,
    requiredSkills: ['Python', 'TypeScript', 'React', 'FastAPI', 'LLM / Gemini API', 'Vector DB'],
    niceToHaveSkills: ['Docker', 'LangChain', 'PyTorch', 'Tailwind CSS'],
    minExperienceYears: 4,
    postedDate: '2026-07-18',
    status: 'Active',
  },
  {
    id: 'job_03',
    recruiterId: 'usr_recruiter_01',
    companyName: 'Innovate Labs',
    companyLogo: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=120&auto=format&fit=crop&q=80',
    title: 'Frontend React UI/UX Engineer',
    department: 'Design System',
    location: 'Austin, TX',
    locationType: 'Hybrid',
    employmentType: 'Full-Time',
    experienceLevel: 'Mid-level',
    salaryRange: '$120,000 - $145,000 / year',
    description: `Craft delighting visual interfaces, accessible design tokens, and smooth Framer Motion animations for our next-generation consumer analytics suite.`,
    requiredSkills: ['React', 'TypeScript', 'Tailwind CSS', 'Figma', 'JavaScript', 'HTML5/CSS3'],
    niceToHaveSkills: ['Storybook', 'Next.js', 'Redux', 'Jest'],
    minExperienceYears: 2,
    postedDate: '2026-07-15',
    status: 'Active',
  },
  {
    id: 'job_04',
    recruiterId: 'usr_recruiter_01',
    companyName: 'CloudScale Inc',
    companyLogo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=120&auto=format&fit=crop&q=80',
    title: 'DevOps & Kubernetes Cloud Infrastructure Lead',
    department: 'Infrastructure',
    location: 'New York, NY',
    locationType: 'Onsite',
    employmentType: 'Full-Time',
    experienceLevel: 'Lead',
    salaryRange: '$170,000 - $210,000 / year',
    description: `Manage multi-cloud AWS & GCP infrastructure, Terraform infrastructure-as-code, and Kubernetes orchestration clusters.`,
    requiredSkills: ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'CI/CD', 'Linux', 'Python'],
    niceToHaveSkills: ['Prometheus', 'Grafana', 'Go', 'Bash'],
    minExperienceYears: 5,
    postedDate: '2026-07-10',
    status: 'Active',
  },
];

export const INITIAL_CANDIDATE_POOL = [
  {
    id: 'usr_cand_01',
    name: 'Alex Morgan',
    email: 'alex.morgan@email.com',
    headline: 'Full Stack Engineer (3 yrs exp)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    resume: SAMPLE_STUDENT_RESUME,
    appliedJobId: 'job_01',
    matchScore: 94, // 90-100% Top Shortlisted Tier
    status: 'Shortlisted' as const,
    appliedAt: '2026-07-21T10:30:00Z',
    coverNote: 'Excited about TechForge! I have 3 years of production experience in React, TypeScript, and Node.js with database optimization wins.',
  },
  {
    id: 'usr_cand_02',
    name: 'Marcus Vance',
    email: 'marcus.vance@dev.net',
    headline: 'Lead React & Node Architect',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    resume: {
      id: 'res_marcus_02',
      fileName: 'Marcus_Vance_Resume.pdf',
      uploadedAt: '2026-07-21T08:15:00Z',
      rawText: 'Marcus Vance - Senior Software Engineer with 5 years experience in React, TypeScript, Node.js, Express, PostgreSQL, Tailwind CSS, Docker, AWS.',
      fullName: 'Marcus Vance',
      email: 'marcus.vance@dev.net',
      phone: '+1 (555) 987-6543',
      summary: 'Senior Software Engineer specializing in modern JavaScript/TypeScript web apps, high throughput microservices, and automated testing.',
      extractedSkills: {
        technical: ['React', 'TypeScript', 'Node.js', 'Express', 'PostgreSQL', 'Tailwind CSS', 'GraphQL', 'Jest'],
        soft: ['Team Leadership', 'Mentorship', 'Agile Architecture'],
        tools: ['Docker', 'AWS', 'Kubernetes', 'Git'],
        certifications: ['AWS Certified Solutions Architect'],
      },
      workExperience: [
        {
          company: 'Vertex Technologies',
          role: 'Staff Software Engineer',
          startDate: '2021-02',
          endDate: 'Present',
          current: true,
          highlights: ['Led team of 6 engineers on enterprise SaaS React platform.', 'Built Node.js GraphQL gateway handling 1M daily requests.'],
        },
      ],
      education: [
        {
          institution: 'Stanford University',
          degree: 'MS in Software Engineering',
          fieldOfStudy: 'Computer Science',
          startYear: '2017',
          endYear: '2019',
        },
      ],
      atsHealthScore: 96,
      formattingIssues: [],
      strengths: ['Flawless technical match', 'Strong staff leadership background'],
      improvements: [],
      keywordVector: ['React', 'TypeScript', 'Node.js', 'Express', 'PostgreSQL', 'Tailwind CSS', 'Docker', 'AWS', 'GraphQL'],
    },
    appliedJobId: 'job_01',
    matchScore: 98, // 90-100% Top Shortlisted Tier
    status: 'Shortlisted' as const,
    appliedAt: '2026-07-21T09:12:00Z',
    coverNote: 'I have led major React/Node cloud refactors and built PostgreSQL infrastructure.',
  },
  {
    id: 'usr_cand_03',
    name: 'Elena Rostova',
    email: 'elena.rostova@ai.io',
    headline: 'AI Product Developer & Python Specialist',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    resume: {
      id: 'res_elena_03',
      fileName: 'Elena_Rostova_Resume.pdf',
      uploadedAt: '2026-07-20T14:20:00Z',
      rawText: 'Elena Rostova - 4 years exp in Python, FastAPI, React, TypeScript, Gemini/OpenAI API, Vector Search, PyTorch, Docker.',
      fullName: 'Elena Rostova',
      email: 'elena.rostova@ai.io',
      phone: '+1 (555) 456-7890',
      summary: 'AI Specialist with deep hands-on expertise in LLMs, fine-tuning, Python FastAPI microservices, and React interfaces.',
      extractedSkills: {
        technical: ['Python', 'FastAPI', 'React', 'TypeScript', 'LLM / Gemini API', 'Vector DB', 'PyTorch', 'Tailwind CSS'],
        soft: ['Research', 'Product Innovation'],
        tools: ['Docker', 'LangChain', 'Git'],
        certifications: ['DeepLearning.AI TensorFlow Professional'],
      },
      workExperience: [
        {
          company: 'Cognitive Dynamics',
          role: 'AI Software Engineer',
          startDate: '2022-08',
          endDate: 'Present',
          current: true,
          highlights: ['Deployed LLM RAG pipelines using Gemini API and Pinecone vector database.'],
        },
      ],
      education: [
        {
          institution: 'MIT',
          degree: 'BS in Artificial Intelligence',
          fieldOfStudy: 'Computer Science & AI',
          startYear: '2018',
          endYear: '2022',
        },
      ],
      atsHealthScore: 94,
      formattingIssues: [],
      strengths: ['Direct match for AI Application Specialist role'],
      improvements: [],
      keywordVector: ['Python', 'FastAPI', 'React', 'TypeScript', 'LLM / Gemini API', 'Vector DB', 'Docker'],
    },
    appliedJobId: 'job_02',
    matchScore: 96, // 90-100% Top Shortlisted Tier
    status: 'Interview Scheduled' as const,
    appliedAt: '2026-07-20T11:00:00Z',
    coverNote: 'Extensive hands-on experience building Gemini RAG agents with FastAPI and React.',
  },
  {
    id: 'usr_cand_04',
    name: 'David Chen',
    email: 'david.chen@frontend.dev',
    headline: 'Junior Web Developer (1.5 yrs exp)',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    resume: {
      id: 'res_david_04',
      fileName: 'David_Chen_WebDev.pdf',
      uploadedAt: '2026-07-19T16:45:00Z',
      rawText: 'David Chen - Junior Frontend Dev with HTML, CSS, JavaScript, React, Tailwind CSS, Git.',
      fullName: 'David Chen',
      email: 'david.chen@frontend.dev',
      phone: '+1 (555) 321-6549',
      summary: 'Junior Frontend Developer eager to build clean React components.',
      extractedSkills: {
        technical: ['React', 'JavaScript', 'HTML5/CSS3', 'Tailwind CSS'],
        soft: ['Enthusiastic', 'Quick Learner'],
        tools: ['Git', 'VS Code'],
        certifications: [],
      },
      workExperience: [
        {
          company: 'Pixel Design Agency',
          role: 'Junior Web Developer',
          startDate: '2023-01',
          endDate: 'Present',
          current: true,
          highlights: ['Built responsive marketing landing pages with HTML, CSS, React.'],
        },
      ],
      education: [
        {
          institution: 'Community College',
          degree: 'Associate Degree',
          fieldOfStudy: 'Web Development',
          startYear: '2020',
          endYear: '2022',
        },
      ],
      atsHealthScore: 78,
      formattingIssues: ['Missing TypeScript expertise and backend Node.js experience'],
      strengths: ['Solid foundation in HTML/CSS and basic React'],
      improvements: ['Learn TypeScript, Node.js, and Express to reach 80%+ threshold for Full Stack roles'],
      keywordVector: ['React', 'JavaScript', 'HTML', 'CSS', 'Tailwind CSS'],
    },
    appliedJobId: 'job_01',
    matchScore: 68, // <80% Match Pool
    status: 'Under Review' as const,
    appliedAt: '2026-07-19T14:10:00Z',
    coverNote: 'Eager to transition to full stack development!',
  },
];

export const INITIAL_APPLICATIONS: JobApplication[] = [
  {
    id: 'app_01',
    jobId: 'job_01',
    candidateId: 'usr_student_01',
    appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    matchScoreAtApplication: 94,
    status: 'Shortlisted',
    coverNote: 'Excited about TechForge! I have 3 years of production experience in React, TypeScript, and Node.js with database optimization wins.',
    recruiterFeedback: 'Top match! Resume indicates strong PostgreSQL query optimization skills and production React experience.',
    interviewDate: '2026-07-26T15:00:00Z',
  },
];

export const SAMPLE_PRESET_RESUMES = [
  {
    name: 'Alex Morgan (Full Stack 94% Match for Job 1)',
    resume: SAMPLE_STUDENT_RESUME,
  },
  {
    name: 'Elena Rostova (AI Developer 96% Match for Job 2)',
    resume: INITIAL_CANDIDATE_POOL[2].resume,
  },
  {
    name: 'David Chen (Junior Frontend Dev - Needs Skill Gap Bridge)',
    resume: INITIAL_CANDIDATE_POOL[3].resume,
  },
];

export const INITIAL_NOTIFICATIONS: NotificationMessage[] = [
  {
    id: 'notif_01',
    recipientRole: 'student',
    recipientEmail: 'alex.morgan@email.com',
    senderRole: 'recruiter',
    senderName: 'Sarah Jenkins (TechForge Lead Recruiter)',
    senderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    subject: '🎉 Interview Invitation: Senior Full Stack Engineer at TechForge',
    content: `Hi Alex,\n\nYour application and ATS resume parsed with an outstanding 94% match for our Senior Full Stack Engineer role at TechForge Inc! We were particularly impressed by your 42% query optimization wins in PostgreSQL and your production React architecture experience.\n\nWe would love to invite you to a 45-minute technical conversation. Please see details below and let us know your availability.`,
    type: 'INVITATION',
    jobId: 'job_01',
    jobTitle: 'Senior Full Stack Engineer',
    candidateId: 'usr_student_01',
    candidateName: 'Alex Morgan',
    interviewDate: '2026-07-26T15:00:00Z',
    meetingLink: 'https://meet.google.com/aura-ats-techforge-interview',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    read: false,
    replies: [
      {
        id: 'reply_01',
        senderRole: 'student',
        senderName: 'Alex Morgan',
        message: 'Thank you Sarah! I am excited about TechForge. The proposed time works great for me.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 'notif_02',
    recipientRole: 'student',
    recipientEmail: 'alex.morgan@email.com',
    senderRole: 'recruiter',
    senderName: 'Sarah Jenkins (TechForge)',
    senderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    subject: 'Application Status Updated: Shortlisted',
    content: `Congratulations Alex! Your candidate profile has been moved to "Shortlisted" status for Senior Full Stack Engineer. Our engineering manager has reviewed your resume breakdown and skill breakdown.`,
    type: 'STATUS_UPDATE',
    jobId: 'job_01',
    jobTitle: 'Senior Full Stack Engineer',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
  {
    id: 'notif_03',
    recipientRole: 'recruiter',
    recipientEmail: 'recruiter@techforge.io',
    senderRole: 'student',
    senderName: 'Elena Rostova',
    senderAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    subject: 'Inquiry regarding AI Systems Architect position',
    content: `Hello Sarah,\n\nI noticed the AI Systems Architect posting at TechForge. I have 4 years of experience with PyTorch and Gemini API integrations. Could you clarify if the role supports full remote work? Thank you!`,
    type: 'INQUIRY',
    jobId: 'job_02',
    jobTitle: 'AI Systems Architect',
    candidateId: 'usr_cand_02',
    candidateName: 'Elena Rostova',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    read: false,
  },
];

