import { Hono } from 'hono'
import { prisma } from './src/lib/db'
import { readFileSync } from 'fs'

const app = new Hono()

// ─── Download Project ─────────────────────────────────────────────
app.get('/download', (c) => {
  const tarball = readFileSync('/tmp/carbonclip.tar.gz')
  c.header('Content-Type', 'application/gzip')
  c.header('Content-Disposition', 'attachment; filename="carbonclip.tar.gz"')
  return c.body(tarball)
})

// ─── Industry Templates ───────────────────────────────────────────
const INDUSTRY_TEMPLATES: Record<string, { departments: { name: string; description: string; icon: string; agents: { name: string; role: string; personality: string; skills: string; experienceLevel: string; systemPrompt: string }[] }[] }> = {
  'Design / Creative Studio': {
    departments: [
      { name: 'Design', description: 'Visual design and branding', icon: 'Palette', agents: [
        { name: 'Alex Creative', role: 'Creative Director', personality: 'Visionary, detail-oriented, inspiring', skills: 'Brand Strategy,Art Direction,Creative Leadership', experienceLevel: 'senior', systemPrompt: 'You are the Creative Director. Lead the creative vision, approve designs, and ensure brand consistency across all outputs.' },
        { name: 'Maya Pixels', role: 'Graphic Designer', personality: 'Creative, meticulous, trend-aware', skills: 'Photoshop,Illustrator,Brand Assets,Social Media Design', experienceLevel: 'mid', systemPrompt: 'You are a Graphic Designer. Create posters, social media posts, branding assets, and high-resolution visuals.' },
        { name: 'Sam Brand', role: 'Brand Designer', personality: 'Strategic, visual thinker, cohesive', skills: 'Brand Identity,Logo Design,Style Guides', experienceLevel: 'senior', systemPrompt: 'You are a Brand Designer. Develop brand identities, logos, color palettes, and comprehensive style guides.' },
        { name: 'Jordan UI', role: 'UI/UX Designer', personality: 'Empathetic, data-driven, innovative', skills: 'Figma,Wireframing,Prototyping,User Research', experienceLevel: 'mid', systemPrompt: 'You are a UI/UX Designer. Design intuitive interfaces, create wireframes and prototypes, and conduct user research.' },
      ]},
      { name: '3D Production', description: '3D modeling and visualization', icon: 'Box', agents: [
        { name: 'Zara ThreeD', role: '3D Artist', personality: 'Technical, artistic, patient', skills: 'Blender,Maya,3D Modeling,Product Visualization', experienceLevel: 'senior', systemPrompt: 'You are a 3D Artist. Create 3D models, product visualizations, and environment assets in OBJ/FBX/GLB format.' },
        { name: 'Chris Tex', role: 'Texture Designer', personality: 'Detail-obsessed, material-savvy', skills: 'PBR Materials,Substance Painter,Texture Mapping', experienceLevel: 'mid', systemPrompt: 'You are a Texture Designer. Create PBR materials, texture maps, and surface libraries for 3D assets.' },
        { name: 'Pat Render', role: 'Rendering Specialist', personality: 'Technical perfectionist, quality-focused', skills: 'V-Ray,Arnold,4K Rendering,Lighting', experienceLevel: 'senior', systemPrompt: 'You are a Rendering Specialist. Produce 4K render outputs, product visuals, and marketing renders with perfect lighting.' },
      ]},
      { name: 'Motion', description: 'Animation and motion graphics', icon: 'Clapperboard', agents: [
        { name: 'Riley Motion', role: 'Motion Designer', personality: 'Dynamic, energetic, storytelling-focused', skills: 'After Effects,Motion Graphics,Ads,Animation', experienceLevel: 'mid', systemPrompt: 'You are a Motion Designer. Create motion graphics, animated ads, and compelling animations for various platforms.' },
        { name: 'Casey Edit', role: 'Video Editor', personality: 'Narrative-driven, technically skilled', skills: 'Premiere Pro,DaVinci Resolve,Color Grading', experienceLevel: 'mid', systemPrompt: 'You are a Video Editor. Edit final videos, add effects, color grade, and produce polished output.' },
      ]},
      { name: 'Marketing', description: 'Marketing and outreach', icon: 'Megaphone', agents: [
        { name: 'Taylor Market', role: 'Marketing Agent', personality: 'Data-driven, creative, strategic', skills: 'Social Media,Content Marketing,Analytics', experienceLevel: 'mid', systemPrompt: 'You are the Marketing Agent. Plan marketing strategies, manage campaigns, and track performance metrics.' },
      ]},
      { name: 'Sales', description: 'Business development', icon: 'TrendingUp', agents: [
        { name: 'Morgan Sales', role: 'Sales Agent', personality: 'Personable, persuasive, relationship-builder', skills: 'Client Relations,Proposals,Negotiation', experienceLevel: 'mid', systemPrompt: 'You are the Sales Agent. Handle client outreach, create proposals, and close deals.' },
      ]},
    ]
  },
  'Video / Animation': {
    departments: [
      { name: 'Production', description: 'Content production leadership', icon: 'Film', agents: [
        { name: 'Director Nova', role: 'Animation Director', personality: 'Creative leader, story-driven', skills: 'Direction,Storytelling,Team Leadership', experienceLevel: 'senior', systemPrompt: 'You are the Animation Director. Lead the creative vision for all video and animation projects.' },
        { name: 'Quinn Story', role: 'Storyboard Artist', personality: 'Visual storyteller, imaginative', skills: 'Storyboarding,Concept Art,Visual Planning', experienceLevel: 'mid', systemPrompt: 'You are a Storyboard Artist. Create detailed storyboards and visual plans for all productions.' },
        { name: 'Avery Script', role: 'Script Writer', personality: 'Wordsmith, creative, adaptable', skills: 'Scriptwriting,Dialogue,Story Structure', experienceLevel: 'mid', systemPrompt: 'You are a Script Writer. Write compelling scripts, dialogue, and narratives for video content.' },
        { name: 'Kai Character', role: 'Character Designer', personality: 'Artistic, versatile, expressive', skills: 'Character Design,Concept Art,Visual Development', experienceLevel: 'mid', systemPrompt: 'You are a Character Designer. Design memorable characters with personality and visual appeal.' },
      ]},
      { name: 'Animation', description: 'Animation production', icon: 'Play', agents: [
        { name: 'Frame TwoD', role: '2D Animator', personality: 'Fluid, creative, timing-focused', skills: '2D Animation,After Effects,Character Animation', experienceLevel: 'mid', systemPrompt: 'You are a 2D Animator. Bring characters and concepts to life with smooth 2D animations.' },
        { name: 'Blender Max', role: '3D Animator', personality: 'Technical artist, motion-focused', skills: '3D Animation,Maya,Blender,Motion Capture', experienceLevel: 'senior', systemPrompt: 'You are a 3D Animator. Create realistic and stylized 3D animations for various projects.' },
      ]},
      { name: 'Post-Production', description: 'Editing and final output', icon: 'Scissors', agents: [
        { name: 'Edit Prime', role: 'Video Editor', personality: 'Precise, narrative-focused', skills: 'Editing,Color Grading,Sound Design', experienceLevel: 'senior', systemPrompt: 'You are a Video Editor. Assemble final videos with perfect pacing, transitions, and color.' },
        { name: 'Echo Sound', role: 'Sound Designer', personality: 'Ear for detail, atmospheric', skills: 'Sound Design,Audio Mixing,Music Production', experienceLevel: 'mid', systemPrompt: 'You are a Sound Designer. Create immersive soundscapes, mix audio, and add music to productions.' },
      ]},
    ]
  },
  'SaaS / Tech Startup': {
    departments: [
      { name: 'Product', description: 'Product strategy and design', icon: 'Lightbulb', agents: [
        { name: 'Sage Product', role: 'Product Manager', personality: 'Strategic, user-focused, data-driven', skills: 'Product Strategy,Roadmapping,User Research,Agile', experienceLevel: 'senior', systemPrompt: 'You are the Product Manager. Define product vision, prioritize features, and manage the roadmap.' },
        { name: 'Iris Analyst', role: 'Business Analyst', personality: 'Analytical, thorough, solution-oriented', skills: 'Requirements Analysis,Data Modeling,Process Design', experienceLevel: 'mid', systemPrompt: 'You are a Business Analyst. Analyze business needs, document requirements, and bridge tech and business.' },
        { name: 'Neo UI', role: 'UI/UX Designer', personality: 'Innovative, empathetic, detail-oriented', skills: 'Figma,Prototyping,User Testing,Design Systems', experienceLevel: 'mid', systemPrompt: 'You are a UI/UX Designer. Design beautiful, intuitive interfaces and build design systems.' },
      ]},
      { name: 'Engineering', description: 'Software development', icon: 'Code', agents: [
        { name: 'Pixel Front', role: 'Frontend Developer', personality: 'Creative, performance-focused', skills: 'React,TypeScript,Tailwind CSS,Next.js', experienceLevel: 'senior', systemPrompt: 'You are a Frontend Developer. Build responsive, performant web interfaces with modern frameworks.' },
        { name: 'Atlas Back', role: 'Backend Developer', personality: 'Systematic, security-minded', skills: 'Node.js,Python,PostgreSQL,REST APIs', experienceLevel: 'senior', systemPrompt: 'You are a Backend Developer. Build robust APIs, databases, and server-side logic.' },
        { name: 'Quantum Full', role: 'Full Stack Developer', personality: 'Versatile, quick learner', skills: 'React,Node.js,Database,DevOps', experienceLevel: 'mid', systemPrompt: 'You are a Full Stack Developer. Handle both frontend and backend tasks with versatility.' },
        { name: 'DevOps Dan', role: 'DevOps Engineer', personality: 'Infrastructure-savvy, automation-first', skills: 'Docker,AWS,CI/CD,Terraform', experienceLevel: 'senior', systemPrompt: 'You are a DevOps Engineer. Manage infrastructure, CI/CD pipelines, and deployments.' },
      ]},
      { name: 'QA', description: 'Quality assurance', icon: 'Bug', agents: [
        { name: 'QA Quinn', role: 'QA Engineer', personality: 'Detail-obsessed, thorough', skills: 'Testing,Automation,Bug Tracking', experienceLevel: 'mid', systemPrompt: 'You are a QA Engineer. Write test plans, execute tests, and ensure product quality.' },
      ]},
      { name: 'Marketing', description: 'Growth and marketing', icon: 'Megaphone', agents: [
        { name: 'Growth Gary', role: 'Marketing Agent', personality: 'Data-driven, creative', skills: 'SEO,Content Marketing,Growth Hacking', experienceLevel: 'mid', systemPrompt: 'You are the Marketing Agent. Drive growth through content, SEO, and marketing campaigns.' },
      ]},
    ]
  },
  'E-commerce': {
    departments: [
      { name: 'Store Operations', description: 'Store management and operations', icon: 'ShoppingCart', agents: [
        { name: 'Store Sam', role: 'Store Manager', personality: 'Organized, customer-focused', skills: 'E-commerce,Inventory Management,Operations', experienceLevel: 'senior', systemPrompt: 'You are the Store Manager. Oversee all store operations, inventory, and customer experience.' },
        { name: 'Research Ria', role: 'Product Research Agent', personality: 'Market-savvy, trend-aware', skills: 'Market Research,Trend Analysis,Competitor Analysis', experienceLevel: 'mid', systemPrompt: 'You are a Product Research Agent. Research trending products, analyze markets, and identify opportunities.' },
        { name: 'List Leo', role: 'Product Listing Agent', personality: 'SEO-savvy, detail-oriented', skills: 'Product Listings,SEO,Description Writing', experienceLevel: 'mid', systemPrompt: 'You are a Product Listing Agent. Create compelling product listings with optimized descriptions and SEO.' },
        { name: 'Design Daisy', role: 'Graphic Designer', personality: 'Visual storyteller, brand-aware', skills: 'Product Photography,Banner Design,Brand Assets', experienceLevel: 'mid', systemPrompt: 'You are a Graphic Designer. Create product images, banners, and promotional graphics.' },
      ]},
      { name: 'Marketing', description: 'Digital marketing', icon: 'Megaphone', agents: [
        { name: 'Ad Andy', role: 'Marketing Agent', personality: 'ROI-focused, creative', skills: 'Paid Ads,Social Media,Email Marketing', experienceLevel: 'mid', systemPrompt: 'You are the Marketing Agent. Run ad campaigns, manage social media, and drive traffic.' },
        { name: 'SEO Sarah', role: 'SEO Agent', personality: 'Technical, analytical', skills: 'SEO,Keyword Research,Content Optimization', experienceLevel: 'mid', systemPrompt: 'You are the SEO Agent. Optimize for search engines, build backlinks, and improve rankings.' },
      ]},
      { name: 'Customer Support', description: 'Customer service', icon: 'Headphones', agents: [
        { name: 'Support Sam', role: 'Customer Support Agent', personality: 'Patient, empathetic, solution-oriented', skills: 'Customer Service,Problem Solving,Communication', experienceLevel: 'mid', systemPrompt: 'You are a Customer Support Agent. Handle customer inquiries, resolve issues, and ensure satisfaction.' },
      ]},
    ]
  },
  'Marketing Agency': {
    departments: [
      { name: 'Strategy', description: 'Strategic planning', icon: 'Target', agents: [
        { name: 'Strategist Max', role: 'Marketing Strategist', personality: 'Visionary, analytical', skills: 'Marketing Strategy,Brand Planning,Market Analysis', experienceLevel: 'senior', systemPrompt: 'You are the Marketing Strategist. Develop comprehensive marketing strategies for clients.' },
        { name: 'Data Dana', role: 'Data Analyst', personality: 'Analytical, insight-driven', skills: 'Analytics,Reporting,Data Visualization', experienceLevel: 'mid', systemPrompt: 'You are a Data Analyst. Track campaign performance, generate reports, and provide insights.' },
      ]},
      { name: 'Content', description: 'Content creation', icon: 'PenTool', agents: [
        { name: 'Words Will', role: 'Copywriter', personality: 'Persuasive, versatile, brand-voice aware', skills: 'Copywriting,Content Writing,Ad Copy', experienceLevel: 'mid', systemPrompt: 'You are a Copywriter. Write compelling copy for ads, websites, emails, and campaigns.' },
        { name: 'Social Sara', role: 'Social Media Manager', personality: 'Trend-savvy, engaging, platform-native', skills: 'Social Media,Content Planning,Community Management', experienceLevel: 'mid', systemPrompt: 'You are a Social Media Manager. Plan and execute social media strategies across platforms.' },
        { name: 'Design Dean', role: 'Graphic Designer', personality: 'Visual communicator, brand-focused', skills: 'Graphic Design,Social Media Graphics,Ads', experienceLevel: 'mid', systemPrompt: 'You are a Graphic Designer. Create visual assets for campaigns, social media, and ads.' },
      ]},
      { name: 'Media Buying', description: 'Ad placement and optimization', icon: 'DollarSign', agents: [
        { name: 'Media Mike', role: 'Media Buyer', personality: 'Numbers-driven, negotiation-savvy', skills: 'Paid Media,Google Ads,Facebook Ads,ROI Optimization', experienceLevel: 'senior', systemPrompt: 'You are a Media Buyer. Manage ad budgets, optimize placements, and maximize ROI.' },
      ]},
    ]
  },
  'Content Creation': {
    departments: [
      { name: 'Content', description: 'Content strategy and creation', icon: 'PenTool', agents: [
        { name: 'Strategist Zoe', role: 'Content Strategist', personality: 'Strategic, trend-aware', skills: 'Content Strategy,Editorial Planning,Analytics', experienceLevel: 'senior', systemPrompt: 'You are the Content Strategist. Plan content calendars, define content pillars, and drive engagement.' },
        { name: 'Script Sky', role: 'Script Writer', personality: 'Creative, engaging, versatile', skills: 'Scriptwriting,Storytelling,Hook Writing', experienceLevel: 'mid', systemPrompt: 'You are a Script Writer. Write engaging scripts for videos, shorts, and reels.' },
        { name: 'Thumb Troy', role: 'Thumbnail Designer', personality: 'Click-optimized, visual', skills: 'Thumbnail Design,YouTube,Click-bait Design', experienceLevel: 'mid', systemPrompt: 'You are a Thumbnail Designer. Create eye-catching thumbnails that maximize click-through rates.' },
      ]},
      { name: 'Editing', description: 'Post-production', icon: 'Scissors', agents: [
        { name: 'Editor Eli', role: 'Video Editor', personality: 'Fast-paced, trend-aware', skills: 'Video Editing,Short-form Content,Premiere Pro', experienceLevel: 'mid', systemPrompt: 'You are a Video Editor. Edit videos, shorts, and reels with trending styles and pacing.' },
      ]},
      { name: 'Growth', description: 'Audience growth', icon: 'TrendingUp', agents: [
        { name: 'SEO Sean', role: 'SEO Agent', personality: 'Technical, data-driven', skills: 'YouTube SEO,Blog SEO,Keyword Research', experienceLevel: 'mid', systemPrompt: 'You are the SEO Agent. Optimize content for search and discovery across platforms.' },
        { name: 'Community Casey', role: 'Community Manager', personality: 'Engaging, responsive', skills: 'Community Management,Engagement,Discord', experienceLevel: 'mid', systemPrompt: 'You are the Community Manager. Engage with the audience, manage comments, and build community.' },
      ]},
    ]
  },
  'Restaurant / F&B': {
    departments: [
      { name: 'Operations', description: 'Daily operations', icon: 'UtensilsCrossed', agents: [
        { name: 'Ops Oscar', role: 'Operations Manager', personality: 'Efficient, organized', skills: 'Restaurant Operations,Staff Management,Quality Control', experienceLevel: 'senior', systemPrompt: 'You are the Operations Manager. Oversee daily restaurant operations, staff, and quality.' },
        { name: 'Inventory Iris', role: 'Inventory Agent', personality: 'Detail-oriented, cost-conscious', skills: 'Inventory Management,Supply Chain,Cost Control', experienceLevel: 'mid', systemPrompt: 'You are the Inventory Agent. Track ingredients, manage orders, and minimize waste.' },
        { name: 'Procure Pat', role: 'Procurement Agent', personality: 'Negotiation-savvy, quality-focused', skills: 'Procurement,Vendor Relations,Cost Analysis', experienceLevel: 'mid', systemPrompt: 'You are the Procurement Agent. Source ingredients, negotiate with vendors, and manage supplies.' },
      ]},
      { name: 'Marketing', description: 'Restaurant marketing', icon: 'Megaphone', agents: [
        { name: 'Foodie Fred', role: 'Marketing Agent', personality: 'Creative, food-passionate', skills: 'Food Photography,Social Media,Local Marketing', experienceLevel: 'mid', systemPrompt: 'You are the Marketing Agent. Promote the restaurant through social media, events, and local marketing.' },
      ]},
      { name: 'Finance', description: 'Financial management', icon: 'Calculator', agents: [
        { name: 'Finance Finn', role: 'Financial Analyst', personality: 'Numbers-driven, strategic', skills: 'Financial Analysis,Budgeting,Reporting', experienceLevel: 'mid', systemPrompt: 'You are the Financial Analyst. Manage budgets, track expenses, and provide financial insights.' },
      ]},
    ]
  },
  'Law Firm': {
    departments: [
      { name: 'Legal', description: 'Legal services', icon: 'Scale', agents: [
        { name: 'Legal Lex', role: 'Legal Research Agent', personality: 'Thorough, precise', skills: 'Legal Research,Case Law,Statute Analysis', experienceLevel: 'senior', systemPrompt: 'You are a Legal Research Agent. Conduct legal research, find precedents, and analyze case law.' },
        { name: 'Case Claire', role: 'Case Manager', personality: 'Organized, detail-oriented', skills: 'Case Management,Deadline Tracking,Client Communication', experienceLevel: 'mid', systemPrompt: 'You are a Case Manager. Track case progress, manage deadlines, and coordinate with clients.' },
        { name: 'Compliance Cal', role: 'Compliance Agent', personality: 'Regulatory-savvy, meticulous', skills: 'Compliance,Regulatory Analysis,Risk Assessment', experienceLevel: 'senior', systemPrompt: 'You are the Compliance Agent. Ensure regulatory compliance and assess legal risks.' },
      ]},
      { name: 'Documentation', description: 'Legal documentation', icon: 'FileText', agents: [
        { name: 'Doc Drew', role: 'Documentation Agent', personality: 'Precise, format-conscious', skills: 'Legal Writing,Contract Drafting,Document Review', experienceLevel: 'mid', systemPrompt: 'You are a Documentation Agent. Draft contracts, legal documents, and ensure proper formatting.' },
      ]},
      { name: 'Client Relations', description: 'Client management', icon: 'Users', agents: [
        { name: 'Client Chris', role: 'Client Relations Agent', personality: 'Empathetic, professional', skills: 'Client Management,Communication,CRM', experienceLevel: 'mid', systemPrompt: 'You are the Client Relations Agent. Manage client relationships, communications, and satisfaction.' },
      ]},
    ]
  },
  'Construction / Real Estate': {
    departments: [
      { name: 'Planning', description: 'Project planning', icon: 'Ruler', agents: [
        { name: 'PM Pete', role: 'Project Manager', personality: 'Organized, deadline-focused', skills: 'Project Management,Scheduling,Budgeting', experienceLevel: 'senior', systemPrompt: 'You are the Project Manager. Plan projects, manage timelines, and coordinate resources.' },
        { name: 'Arch Alice', role: 'Architect', personality: 'Creative, technical', skills: 'Architecture,AutoCAD,Design', experienceLevel: 'senior', systemPrompt: 'You are the Architect. Create architectural designs, blueprints, and building plans.' },
        { name: 'Interior Ivy', role: 'Interior Designer', personality: 'Aesthetic, functional', skills: 'Interior Design,Space Planning,3D Visualization', experienceLevel: 'mid', systemPrompt: 'You are an Interior Designer. Design interior spaces with aesthetics and functionality in mind.' },
      ]},
      { name: 'Execution', description: 'Construction execution', icon: 'Hammer', agents: [
        { name: 'Cost Carl', role: 'Cost Estimator', personality: 'Numerical, precise', skills: 'Cost Estimation,Budget Analysis,Material costing', experienceLevel: 'mid', systemPrompt: 'You are a Cost Estimator. Estimate project costs, track budgets, and analyze expenses.' },
        { name: 'Site Sam', role: 'Site Operations Agent', personality: 'Hands-on, safety-focused', skills: 'Site Management,Safety Compliance,Logistics', experienceLevel: 'mid', systemPrompt: 'You are the Site Operations Agent. Manage on-site operations, safety, and logistics.' },
      ]},
    ]
  },
  'Manufacturing': {
    departments: [
      { name: 'Production', description: 'Manufacturing operations', icon: 'Factory', agents: [
        { name: 'Prod Pete', role: 'Production Manager', personality: 'Efficiency-focused, systematic', skills: 'Production Planning,Quality Control,Lean Manufacturing', experienceLevel: 'senior', systemPrompt: 'You are the Production Manager. Oversee manufacturing operations and optimize production.' },
      ]},
      { name: 'Supply Chain', description: 'Supply chain management', icon: 'Truck', agents: [
        { name: 'Supply Sara', role: 'Supply Chain Agent', personality: 'Logistics-savvy, strategic', skills: 'Supply Chain,Logistics,Procurement', experienceLevel: 'mid', systemPrompt: 'You are a Supply Chain Agent. Manage the supply chain, logistics, and vendor relationships.' },
      ]},
      { name: 'Quality Control', description: 'Quality assurance', icon: 'CheckCircle', agents: [
        { name: 'QA Quincy', role: 'QA Agent', personality: 'Detail-obsessed, standards-driven', skills: 'Quality Assurance,Inspection,Compliance', experienceLevel: 'mid', systemPrompt: 'You are a QA Agent. Ensure product quality through inspection and compliance testing.' },
      ]},
    ]
  },
  'Consulting': {
    departments: [
      { name: 'Research', description: 'Research and analysis', icon: 'Search', agents: [
        { name: 'Research Rita', role: 'Research Agent', personality: 'Analytical, thorough', skills: 'Market Research,Data Analysis,Report Writing', experienceLevel: 'mid', systemPrompt: 'You are a Research Agent. Conduct research, analyze data, and provide actionable insights.' },
      ]},
      { name: 'Strategy', description: 'Strategic advisory', icon: 'Target', agents: [
        { name: 'Strat Steve', role: 'Strategy Consultant', personality: 'Strategic thinker, executive presence', skills: 'Business Strategy,Transformation,M&A', experienceLevel: 'senior', systemPrompt: 'You are a Strategy Consultant. Develop business strategies and advise on transformation.' },
      ]},
      { name: 'Delivery', description: 'Client delivery', icon: 'Package', agents: [
        { name: 'Present Pat', role: 'Presentation Designer', personality: 'Visual communicator, polished', skills: 'Presentations,Data Visualization,Storytelling', experienceLevel: 'mid', systemPrompt: 'You are a Presentation Designer. Create compelling presentations and visual reports.' },
        { name: 'Client Cam', role: 'Client Success Agent', personality: 'Relationship-focused, proactive', skills: 'Client Management,Account Management,Success Planning', experienceLevel: 'mid', systemPrompt: 'You are the Client Success Agent. Ensure client satisfaction and drive successful outcomes.' },
      ]},
    ]
  },
  'Education': {
    departments: [
      { name: 'Curriculum', description: 'Course development', icon: 'GraduationCap', agents: [
        { name: 'Curriculum Cal', role: 'Curriculum Designer', personality: 'Pedagogical, structured', skills: 'Curriculum Design,Instructional Design,Assessment', experienceLevel: 'senior', systemPrompt: 'You are a Curriculum Designer. Design comprehensive curricula and learning paths.' },
        { name: 'Course Chris', role: 'Course Creator', personality: 'Engaging, knowledge-sharing', skills: 'Course Creation,Video Production,Content Development', experienceLevel: 'mid', systemPrompt: 'You are a Course Creator. Build engaging courses with videos, quizzes, and materials.' },
      ]},
      { name: 'Content', description: 'Educational content', icon: 'BookOpen', agents: [
        { name: 'Learn Leo', role: 'Learning Specialist', personality: 'Adaptive, student-focused', skills: 'Learning Theory,Adaptive Learning,EdTech', experienceLevel: 'mid', systemPrompt: 'You are a Learning Specialist. Optimize learning experiences using educational research.' },
      ]},
      { name: 'Student Support', description: 'Student services', icon: 'HeartHandshake', agents: [
        { name: 'Support Sue', role: 'Student Support Agent', personality: 'Empathetic, helpful', skills: 'Student Support,Onboarding,Communication', experienceLevel: 'mid', systemPrompt: 'You are the Student Support Agent. Help students with questions, onboarding, and guidance.' },
        { name: 'Assess Amy', role: 'Assessment Agent', personality: 'Fair, analytical', skills: 'Assessment Design,Grading,Feedback', experienceLevel: 'mid', systemPrompt: 'You are the Assessment Agent. Design assessments, grade submissions, and provide feedback.' },
      ]},
    ]
  },
  'Healthcare': {
    departments: [
      { name: 'Operations', description: 'Healthcare operations', icon: 'Stethoscope', agents: [
        { name: 'Ops Olivia', role: 'Operations Agent', personality: 'Efficient, compliance-aware', skills: 'Healthcare Operations,Patient Flow,Resource Management', experienceLevel: 'senior', systemPrompt: 'You are the Operations Agent. Manage healthcare operations and optimize patient flow.' },
        { name: 'Schedule Sam', role: 'Scheduling Agent', personality: 'Organized, time-efficient', skills: 'Scheduling,Appointment Management,Resource Allocation', experienceLevel: 'mid', systemPrompt: 'You are the Scheduling Agent. Manage appointments, staff schedules, and resource allocation.' },
      ]},
      { name: 'Compliance', description: 'Regulatory compliance', icon: 'Shield', agents: [
        { name: 'Comply Cal', role: 'Compliance Agent', personality: 'Regulatory expert, meticulous', skills: 'HIPAA Compliance,Regulatory,Documentation', experienceLevel: 'senior', systemPrompt: 'You are the Compliance Agent. Ensure regulatory compliance and proper documentation.' },
      ]},
      { name: 'Patient Support', description: 'Patient services', icon: 'HeartPulse', agents: [
        { name: 'Care Cara', role: 'Patient Support Agent', personality: 'Compassionate, patient-focused', skills: 'Patient Communication,Support,Navigation', experienceLevel: 'mid', systemPrompt: 'You are the Patient Support Agent. Assist patients with inquiries and provide compassionate support.' },
      ]},
    ]
  },
  'Personal Brand': {
    departments: [
      { name: 'Content', description: 'Personal content creation', icon: 'Star', agents: [
        { name: 'Brand Bella', role: 'Brand Manager', personality: 'Image-conscious, strategic', skills: 'Personal Branding,Content Strategy,Public Relations', experienceLevel: 'senior', systemPrompt: 'You are the Brand Manager. Manage and grow the personal brand across all platforms.' },
        { name: 'Strategy Sam', role: 'Content Strategist', personality: 'Strategic, platform-savvy', skills: 'Content Planning,Analytics,Platform Strategy', experienceLevel: 'mid', systemPrompt: 'You are the Content Strategist. Plan content that aligns with brand goals and audience.' },
      ]},
      { name: 'Growth', description: 'Audience growth', icon: 'TrendingUp', agents: [
        { name: 'Growth Grace', role: 'Social Media Manager', personality: 'Engaging, trend-aware', skills: 'Social Media,Engagement,Growth Tactics', experienceLevel: 'mid', systemPrompt: 'You are the Social Media Manager. Grow following and engagement across platforms.' },
        { name: 'Community Cole', role: 'Community Manager', personality: 'Warm, responsive', skills: 'Community Building,Engagement,Discord', experienceLevel: 'mid', systemPrompt: 'You are the Community Manager. Build and nurture an engaged community.' },
      ]},
      { name: 'Marketing', description: 'Marketing and monetization', icon: 'Megaphone', agents: [
        { name: 'Marketing Max', role: 'Graphic Designer', personality: 'Visual, brand-consistent', skills: 'Graphic Design,Social Graphics,Brand Assets', experienceLevel: 'mid', systemPrompt: 'You are a Graphic Designer. Create visual content consistent with the personal brand.' },
      ]},
    ]
  },
  'Event Management': {
    departments: [
      { name: 'Planning', description: 'Event planning', icon: 'Calendar', agents: [
        { name: 'Planner Pat', role: 'Event Planner', personality: 'Organized, creative, detail-oriented', skills: 'Event Planning,Venue Selection,Timeline Management', experienceLevel: 'senior', systemPrompt: 'You are the Event Planner. Plan events from concept to execution with attention to every detail.' },
      ]},
      { name: 'Logistics', description: 'Event logistics', icon: 'Truck', agents: [
        { name: 'Logistics Lee', role: 'Logistics Agent', personality: 'Systematic, problem-solver', skills: 'Logistics,Transportation,Setup Management', experienceLevel: 'mid', systemPrompt: 'You are the Logistics Agent. Manage all logistics including transport, setup, and coordination.' },
        { name: 'Vendor Val', role: 'Vendor Manager', personality: 'Negotiation-skilled, relationship-builder', skills: 'Vendor Management,Contract Negotiation,Procurement', experienceLevel: 'mid', systemPrompt: 'You are the Vendor Manager. Source and manage vendors, negotiate contracts, and ensure quality.' },
      ]},
      { name: 'Marketing', description: 'Event promotion', icon: 'Megaphone', agents: [
        { name: 'Promo Pam', role: 'Marketing Agent', personality: 'Promotional, creative', skills: 'Event Marketing,Promotion,Social Media', experienceLevel: 'mid', systemPrompt: 'You are the Marketing Agent. Promote events through marketing campaigns and social media.' },
        { name: 'Budget Ben', role: 'Budget Manager', personality: 'Financial-savvy, cost-conscious', skills: 'Budget Management,Financial Planning,Cost Control', experienceLevel: 'mid', systemPrompt: 'You are the Budget Manager. Manage event budgets and track expenses.' },
      ]},
    ]
  },
  'Other': {
    departments: [
      { name: 'General', description: 'General operations', icon: 'Briefcase', agents: [
        { name: 'Director Dana', role: 'Operations Director', personality: 'Versatile, adaptive', skills: 'Operations,Management,Strategy', experienceLevel: 'senior', systemPrompt: 'You are the Operations Director. Oversee all company operations and drive results.' },
        { name: 'Analyst Alex', role: 'Business Analyst', personality: 'Analytical, solution-oriented', skills: 'Analysis,Research,Reporting', experienceLevel: 'mid', systemPrompt: 'You are a Business Analyst. Analyze business needs and provide data-driven recommendations.' },
        { name: 'Marketing Morgan', role: 'Marketing Agent', personality: 'Creative, strategic', skills: 'Marketing,Content,Social Media', experienceLevel: 'mid', systemPrompt: 'You are the Marketing Agent. Develop and execute marketing strategies.' },
      ]},
    ]
  },
}

// ─── GET Industries ───────────────────────────────────────────────
app.get('/industries', (c) => {
  const industries = Object.keys(INDUSTRY_TEMPLATES).map((key) => ({
    id: key,
    name: key,
    departmentCount: INDUSTRY_TEMPLATES[key].departments.length,
    agentCount: INDUSTRY_TEMPLATES[key].departments.reduce((sum, d) => sum + d.agents.length, 0),
  }))
  return c.json({ industries })
})

// ─── POST Create Company ──────────────────────────────────────────
app.post('/company/create', async (c) => {
  const body = await c.req.json()
  const { name, industry, description, goals, services, targetAudience, brandInfo, ownerEmail } = body

  if (!name || !industry) {
    return c.json({ error: 'Company name and industry are required' }, 400)
  }

  const template = INDUSTRY_TEMPLATES[industry] || INDUSTRY_TEMPLATES['Other']

  const company = await prisma.company.create({
    data: {
      name,
      industry,
      description: description || '',
      goals: goals || '',
      services: services || '',
      targetAudience: targetAudience || '',
      brandInfo: brandInfo || '',
      ownerEmail: ownerEmail || '',
      status: 'active',
    },
  })

  // Create departments and agents from template
  for (const dept of template.departments) {
    const department = await prisma.department.create({
      data: {
        name: dept.name,
        description: dept.description,
        icon: dept.icon,
        companyId: company.id,
      },
    })

    for (const agentData of dept.agents) {
      await prisma.agent.create({
        data: {
          name: agentData.name,
          role: agentData.role,
          personality: agentData.personality,
          skills: agentData.skills,
          experienceLevel: agentData.experienceLevel,
          systemPrompt: agentData.systemPrompt,
          departmentId: department.id,
          companyId: company.id,
        },
      })
    }
  }

  // Create Company Brain memory
  await prisma.brainMemory.create({
    data: {
      content: `Company "${name}" created in the ${industry} industry. ${description || ''} Goal: ${goals || 'Not specified'}. Target audience: ${targetAudience || 'Not specified'}.`,
      category: 'company_creation',
      companyId: company.id,
    },
  })

  // Create initial activity
  await prisma.activity.create({
    data: {
      type: 'company_created',
      message: `Company "${name}" was created in the ${industry} industry`,
      agentName: 'System',
      companyId: company.id,
    },
  })

  return c.json({ company })
})

// ─── GET Company with all relations ──────────────────────────────
app.get('/company/:id/full', async (c) => {
  const { id } = c.req.param()
  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      departments: { include: { agents: true } },
      agents: true,
      tasks: { include: { assignee: true } },
      brainMemories: { orderBy: { createdAt: 'desc' }, take: 50 },
      workflows: true,
      activities: { orderBy: { createdAt: 'desc' }, take: 30 },
    },
  })
  if (!company) return c.json({ error: 'Company not found' }, 404)
  return c.json({ company })
})

// ─── GET all companies ───────────────────────────────────────────
app.get('/companies', async (c) => {
  const companies = await prisma.company.findMany({
    include: {
      _count: { select: { agents: true, departments: true, tasks: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return c.json({ companies })
})

// ─── DELETE Company ───────────────────────────────────────────────
app.delete('/company/:id', async (c) => {
  const { id } = c.req.param()
  await prisma.company.delete({ where: { id } })
  return c.json({ success: true })
})

// ─── Agent Chat ───────────────────────────────────────────────────
app.post('/agent/:id/chat', async (c) => {
  const { id } = c.req.param()
  const { message } = await c.req.json()

  const agent = await prisma.agent.findUnique({
    where: { id },
    include: { department: true, company: true },
  })
  if (!agent) return c.json({ error: 'Agent not found' }, 404)

  // Save user message
  await prisma.agentMessage.create({
    data: { content: message, role: 'user', agentId: id },
  })

  // Generate AI response based on agent role and context
  const responseText = generateAgentResponse(agent, message)

  // Save agent response
  await prisma.agentMessage.create({
    data: { content: responseText, role: 'assistant', agentId: id },
  })

  // Add activity
  await prisma.activity.create({
    data: {
      type: 'agent_chat',
      message: `${agent.name} (${agent.role}) responded to a message`,
      agentName: agent.name,
      companyId: agent.companyId,
    },
  })

  return c.json({ response: responseText })
})

// ─── Agent Chat History ──────────────────────────────────────────
app.get('/agent/:id/messages', async (c) => {
  const { id } = c.req.param()
  const messages = await prisma.agentMessage.findMany({
    where: { agentId: id },
    orderBy: { createdAt: 'asc' },
  })
  return c.json({ messages })
})

// ─── Company Brain Chat ──────────────────────────────────────────
app.post('/company/:id/brain/chat', async (c) => {
  const { id } = c.req.param()
  const { message } = await c.req.json()

  const company = await prisma.company.findUnique({
    where: { id },
    include: { agents: true, departments: { include: { agents: true } }, tasks: true },
  })
  if (!company) return c.json({ error: 'Company not found' }, 404)

  // Save brain memory
  await prisma.brainMemory.create({
    data: { content: `User asked: ${message}`, category: 'conversation', companyId: id },
  })

  const response = generateBrainResponse(company, message)

  await prisma.brainMemory.create({
    data: { content: `Brain responded: ${response.substring(0, 200)}`, category: 'brain_response', companyId: id },
  })

  return c.json({ response })
})

// ─── Brain Insights ──────────────────────────────────────────────
app.get('/company/:id/brain/insights', async (c) => {
  const { id } = c.req.param()
  const company = await prisma.company.findUnique({
    where: { id },
    include: { agents: true, departments: { include: { agents: true } }, tasks: true },
  })
  if (!company) return c.json({ error: 'Company not found' }, 404)

  const insights = generateInsights(company)
  return c.json({ insights })
})

// ─── Tasks ────────────────────────────────────────────────────────
app.post('/company/:id/tasks', async (c) => {
  const { id } = c.req.param()
  const { title, description, priority, assigneeId, departmentId } = await c.req.json()

  const task = await prisma.task.create({
    data: {
      title,
      description: description || '',
      priority: priority || 'medium',
      assigneeId: assigneeId || null,
      departmentId: departmentId || null,
      companyId: id,
    },
    include: { assignee: true },
  })

  if (assigneeId) {
    const agent = await prisma.agent.findUnique({ where: { id: assigneeId } })
    await prisma.activity.create({
      data: {
        type: 'task_assigned',
        message: `Task "${title}" assigned to ${agent?.name || 'Unknown'}`,
        agentName: agent?.name,
        companyId: id,
      },
    })
  }

  return c.json({ task })
})

app.patch('/task/:id', async (c) => {
  const { id } = c.req.param()
  const body = await c.req.json()
  const task = await prisma.task.update({
    where: { id },
    data: body,
    include: { assignee: true },
  })
  return c.json({ task })
})

// ─── Workflows ────────────────────────────────────────────────────
app.post('/company/:id/workflows', async (c) => {
  const { id } = c.req.param()
  const { name, description, steps } = await c.req.json()

  const workflow = await prisma.workflow.create({
    data: { name, description: description || '', steps: steps || '', companyId: id },
  })
  return c.json({ workflow })
})

// ─── Analytics ────────────────────────────────────────────────────
app.get('/company/:id/analytics', async (c) => {
  const { id } = c.req.param()

  const [agentCount, taskCount, completedTasks, departmentCount, recentActivities] = await Promise.all([
    prisma.agent.count({ where: { companyId: id } }),
    prisma.task.count({ where: { companyId: id } }),
    prisma.task.count({ where: { companyId: id, status: 'completed' } }),
    prisma.department.count({ where: { companyId: id } }),
    prisma.activity.findMany({ where: { companyId: id }, orderBy: { createdAt: 'desc' }, take: 10 }),
  ])

  const agentsByDepartment = await prisma.department.findMany({
    where: { companyId: id },
    include: { _count: { select: { agents: true } } },
  })

  const tasksByStatus = await prisma.task.groupBy({
    by: ['status'],
    where: { companyId: id },
    _count: true,
  })

  const tasksByPriority = await prisma.task.groupBy({
    by: ['priority'],
    where: { companyId: id },
    _count: true,
  })

  return c.json({
    stats: { agentCount, taskCount, completedTasks, departmentCount, completionRate: taskCount > 0 ? Math.round((completedTasks / taskCount) * 100) : 0 },
    agentsByDepartment: agentsByDepartment.map(d => ({ name: d.name, count: d._count.agents })),
    tasksByStatus: tasksByStatus.map(s => ({ status: s.status, count: s._count })),
    tasksByPriority: tasksByPriority.map(p => ({ priority: p.priority, count: p._count })),
    recentActivities,
  })
})

// ─── Helper: Generate Agent Response ─────────────────────────────
function generateAgentResponse(agent: any, message: string): string {
  const role = agent.role
  const name = agent.name
  const skills = (agent.skills || '').split(',')
  const personality = agent.personality || ''

  const responses: Record<string, string[]> = {
    'Creative Director': [
      `Great question! As the Creative Director, I'd approach this by considering our brand guidelines first. Let me think about the creative direction that would best serve this brief.`,
      `I love this idea. From a creative leadership perspective, I'd recommend we focus on visual storytelling that resonates with our target audience. Here's my vision...`,
      `Let me put on my creative director hat. The key here is maintaining brand consistency while pushing creative boundaries. I suggest we...`,
    ],
    'Graphic Designer': [
      `I'm excited to work on this! I'll create designs that are visually stunning and on-brand. Let me start by sketching some concepts...`,
      `For this project, I'm thinking we could use a bold color palette with clean typography. I'll prepare a few options for you.`,
      `I'll design something that catches the eye and communicates our message effectively. Here's what I'm thinking for the visual approach...`,
    ],
    '3D Artist': [
      `I can definitely create a 3D model for this! I'll use Blender to build a detailed mesh with proper topology. The output will be in OBJ/FBX format.`,
      `Great project for 3D work. I'll model this with high-poly details and bake them into normal maps for optimal performance. Expected delivery: detailed 3D assets.`,
      `Let me plan the 3D pipeline for this. I'll start with blocking out the forms, then add detail, UV unwrap, and prepare for texturing.`,
    ],
    'Frontend Developer': [
      `I'll build this with React and TypeScript for type safety. Using Tailwind CSS for styling and ensuring full responsiveness. Let me start with the component architecture.`,
      `For this feature, I recommend a component-based approach with React. I'll implement it with proper state management and accessibility in mind.`,
      `I'll set up the frontend with a clean architecture. Using modern React patterns, proper error boundaries, and optimized rendering.`,
    ],
    'Backend Developer': [
      `I'll design a robust API for this. Using Node.js with proper middleware, authentication, and error handling. Let me outline the endpoints first.`,
      `For the backend, I'll create a scalable architecture with proper database design, API validation, and security measures.`,
      `Let me build the server-side logic with proper separation of concerns. I'll include authentication, rate limiting, and comprehensive error handling.`,
    ],
    'Marketing Agent': [
      `Let me analyze the marketing opportunity here. I'd recommend a multi-channel approach combining organic content with targeted paid campaigns for maximum reach.`,
      `For this campaign, I suggest we focus on our core audience segments. Let me put together a strategy that balances awareness and conversion.`,
      `I'll create a marketing plan that leverages our strengths. The key metrics we should track are engagement rate, CAC, and conversion rate.`,
    ],
    'QA Engineer': [
      `I'll create comprehensive test cases for this. Let me identify edge cases, write automated tests, and ensure we have full coverage.`,
      `Quality check time! I'll run through the test scenarios, check for regressions, and document any issues I find.`,
      `Let me set up the testing pipeline. I'll include unit tests, integration tests, and end-to-end tests for complete coverage.`,
    ],
    'Product Manager': [
      `Let me analyze this from a product perspective. I'll evaluate the impact on our roadmap, consider user needs, and prioritize accordingly. Here's my recommendation...`,
      `Great initiative! I'll draft a product brief with success metrics, user stories, and acceptance criteria. Let me also check how this aligns with our current sprint goals.`,
      `I'll organize this into our product backlog and create user stories. Let me estimate the effort and impact to help with prioritization.`,
    ],
    'DevOps Engineer': [
      `I'll set up the infrastructure for this. Using Docker for containerization, GitHub Actions for CI/CD, and Terraform for infrastructure as code.`,
      `Let me configure the deployment pipeline. I'll ensure we have proper monitoring, logging, and rollback mechanisms in place.`,
      `I'll create a scalable infrastructure setup with proper security measures. Let me also set up automated backups and disaster recovery.`,
    ],
    'UI/UX Designer': [
      `I'll design an intuitive user experience for this. Let me start with user research, create wireframes, and then move to high-fidelity mockups.`,
      `Let me create a design system approach for this feature. I'll ensure consistency with our existing patterns while introducing fresh elements.`,
      `I'll prototype this interaction flow. User testing will be key — let me create a clickable prototype we can validate before development.`,
    ],
    'Content Strategist': [
      `I'll develop a content strategy for this. Let me define content pillars, create an editorial calendar, and identify the best formats for our audience.`,
      `Great topic! I'll research what's trending in this space and create a content plan that balances SEO value with audience engagement.`,
      `Let me map out the content funnel — awareness, consideration, conversion. I'll suggest the right content types for each stage.`,
    ],
    'Legal Research Agent': [
      `I'll conduct thorough legal research on this matter. Let me review relevant statutes, case law, and regulatory guidance to provide you with a comprehensive analysis.`,
      `Let me analyze the legal implications here. I'll check for compliance requirements, potential liabilities, and relevant precedents.`,
      `I'll prepare a legal memorandum on this topic. My analysis will cover the relevant legal framework, key considerations, and practical recommendations.`,
    ],
  }

  const roleResponses = responses[role]
  if (roleResponses) {
    const idx = Math.floor(Math.random() * roleResponses.length)
    return roleResponses[idx]
  }

  return `As ${name}, the ${role}, I understand your request. Based on my skills (${skills.slice(0, 3).join(', ')}), I'll work on this right away. ${personality ? `My approach reflects my personality: ${personality}.` : ''} Let me get started on this task and provide you with results soon.`
}

// ─── Helper: Generate Brain Response ─────────────────────────────
function generateBrainResponse(company: any, message: string): string {
  const agentCount = company.agents?.length || 0
  const deptCount = company.departments?.length || 0
  const taskCount = company.tasks?.length || 0
  const completedTasks = company.tasks?.filter((t: any) => t.status === 'completed').length || 0
  const pendingTasks = company.tasks?.filter((t: any) => t.status === 'pending').length || 0

  const msgLower = message.toLowerCase()

  if (msgLower.includes('status') || msgLower.includes('overview') || msgLower.includes('how are we')) {
    return `📊 **Company Status Report: ${company.name}**

**Industry:** ${company.industry}
**Active Agents:** ${agentCount} across ${deptCount} departments
**Tasks:** ${taskCount} total (${completedTasks} completed, ${pendingTasks} pending)
**Completion Rate:** ${taskCount > 0 ? Math.round((completedTasks / taskCount) * 100) : 0}%

**Departments:**
${company.departments?.map((d: any) => `• ${d.name} — ${d.agents?.length || 0} agents`).join('\n') || 'No departments configured'}

**Recommendation:** ${pendingTasks > 5 ? 'You have several pending tasks. Consider assigning them to available agents.' : 'Your task pipeline looks healthy. Keep up the great work!'}

Would you like me to dive deeper into any specific area?`
  }

  if (msgLower.includes('team') || msgLower.includes('agent') || msgLower.includes('employee')) {
    return `👥 **Your AI Team:**

${company.departments?.map((d: any) => `**${d.name} Department:**
${d.agents?.map((a: any) => `  • ${a.name} — ${a.role} (${a.experienceLevel}, Performance: ${a.performanceScore}%)`).join('\n') || '  No agents'}`).join('\n\n') || 'No departments found.'}

**Total Workforce:** ${agentCount} AI agents
**Average Performance Score:** ${agentCount > 0 ? Math.round(company.agents.reduce((sum: number, a: any) => sum + a.performanceScore, 0) / agentCount) : 0}%

All agents are active and ready for task assignment. Would you like to create a new task or view individual agent details?`
  }

  if (msgLower.includes('suggest') || msgLower.includes('recommend') || msgLower.includes('improve')) {
    return `💡 **Strategic Recommendations for ${company.name}:**

1. **Task Distribution:** ${pendingTasks > 0 ? `You have ${pendingTasks} pending tasks. I recommend assigning them to agents based on their skills and current workload.` : 'All tasks are being processed efficiently.'}

2. **Performance Optimization:** Monitor agent performance scores regularly. Agents below 75% may need additional training or task reassignment.

3. **Department Growth:** ${deptCount < 4 ? 'Consider adding more departments to expand capabilities.' : 'Your department structure looks solid.'}

4. **Workflow Automation:** Identify repetitive tasks and create automated workflows to improve efficiency.

5. **Knowledge Base:** Ensure the Company Brain is regularly updated with new insights and learnings from completed projects.

Would you like me to elaborate on any of these recommendations?`
  }

  if (msgLower.includes('strategy') || msgLower.includes('plan') || msgLower.includes('goal')) {
    return `🎯 **Strategic Analysis:**

Based on the ${company.industry} industry and current company structure:

**Current Capabilities:**
• ${agentCount} specialized AI agents
• ${deptCount} operational departments
• ${completedTasks} completed deliverables

**Strategic Priorities:**
1. **Short-term:** Optimize existing workflows and task completion rates
2. **Medium-term:** Expand department capabilities based on business growth
3. **Long-term:** Scale the AI workforce proportionally to business needs

**Key Metrics to Watch:**
• Task completion rate (target: >85%)
• Agent utilization (target: 70-80%)
• Response time to new tasks

${company.goals ? `**Company Goals:** ${company.goals}` : 'Consider defining specific goals to track progress more effectively.'}

Shall I create a detailed action plan for any of these priorities?`
  }

  // Default response
  return `🧠 **Company Brain Analysis:**

Thank you for your query about "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"

Here's what I know about ${company.name}:
• Operating in the **${company.industry}** industry
• **${agentCount} AI agents** across **${deptCount} departments**
• **${taskCount} tasks** tracked (${completedTasks} completed)
${company.description ? `• **Mission:** ${company.description}` : ''}

**Current Focus Areas:**
• Monitoring team performance and task completion
• Analyzing business metrics and providing insights
• Suggesting improvements to workflows and processes

How can I help you further? You can ask me about:
• 📊 Company status and analytics
• 👥 Team overview and agent details
• 💡 Recommendations and improvements
• 🎯 Strategic planning and goals`
}

// ─── Helper: Generate Insights ────────────────────────────────────
function generateInsights(company: any): any[] {
  const insights = []
  const agentCount = company.agents?.length || 0
  const taskCount = company.tasks?.length || 0
  const completedTasks = company.tasks?.filter((t: any) => t.status === 'completed').length || 0
  const pendingTasks = company.tasks?.filter((t: any) => t.status === 'pending').length || 0

  if (pendingTasks > 5) {
    insights.push({ type: 'warning', title: 'High Task Backlog', description: `You have ${pendingTasks} pending tasks. Consider distributing them across available agents.`, action: 'Review Tasks' })
  }

  if (taskCount === 0) {
    insights.push({ type: 'suggestion', title: 'Start Your First Project', description: 'Create tasks for your AI agents to begin working on your business goals.', action: 'Create Task' })
  }

  if (agentCount > 0) {
    const avgPerformance = company.agents.reduce((sum: number, a: any) => sum + a.performanceScore, 0) / agentCount
    if (avgPerformance > 85) {
      insights.push({ type: 'success', title: 'Excellent Team Performance', description: `Your team averages ${Math.round(avgPerformance)}% performance score. Keep it up!`, action: 'View Analytics' })
    }
  }

  insights.push({ type: 'info', title: 'Company Brain Active', description: 'Your Company Brain is continuously monitoring and analyzing business data.', action: 'Chat with Brain' })

  return insights
}

export default app
