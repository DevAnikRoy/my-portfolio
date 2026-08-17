import apnakeyImg from '../assets/projects/apnakey.jpg';
import humanStudioImg from '../assets/projects/human-studio.jpg';
import airborneImg from '../assets/projects/airborne.jpg';
import housemaxImg from '../assets/projects/housemax.jpg';
import betweenImg from '../assets/projects/between.jpg';

const PROJECTS = [
  {
    id: 1,
    num: '01',
    title: 'Garden Hub Platform',
    desc: 'A full-featured e-commerce platform with user authentication, payment processing, and admin dashboard.',
    image: 'https://www.brandywine.org/sites/default/files/styles/body_full/public/2025-04/GardenHub_3.jpg?itok=8L_pb6Vv',
    tech: ['React', 'Node.js', 'MongoDB', 'Firebase', 'Express.js'],
    live: 'https://garden-hub-53195.web.app/',
    git: 'https://github.com/DevAnikRoy/garden-hub-client?tab=readme-ov-file',
    fullDescription:
      'Garden Hub is a scalable marketplace for gardening products with secure authentication, payment integration, and an admin dashboard.',
    challenges: [
      'Implementing secure payment workflows.',
      'Ensuring responsive UI across devices.',
    ],
    improvements: [
      'Add AI-powered plant recommendations.',
      'Introduce subscription-based services.',
    ],
    type: 'Full Stack Web App',
    duration: '3 months',
    aliases: ['garden hub', 'gardenhub'],
    featured: true,
  },
  {
    id: 2,
    num: '02',
    title: 'ServiceHub',
    desc: 'A full-stack service booking platform where users book services and providers manage assigned tasks.',
    image:
      'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=500',
    tech: ['React', 'TailwindCSS', 'Framer Motion', 'Firebase Auth', 'Node.js', 'Express', 'MongoDB'],
    live: 'https://service-assignment-f070a.web.app/',
    git: 'https://github.com/DevAnikRoy/ServiceHub-Client',
    fullDescription:
      'ServiceHub connects users with service providers, offering booking, task management, and secure authentication.',
    challenges: [
      'Managing real-time booking conflicts.',
      'Optimizing backend queries for speed.',
    ],
    improvements: ['Add mobile app integration.', 'Implement AI-driven scheduling.'],
    type: 'Full Stack Web App',
    duration: '3 months',
    aliases: ['servicehub', 'service hub'],
    featured: true,
  },
  {
    id: 3,
    num: '03',
    title: 'AppStore Platform',
    desc: 'An interactive AppStore SPA where users explore, install, and review apps across categories.',
    image: 'https://i.ibb.co/rfmssRVY/Screenshot-2025-06-30-024603.png',
    tech: ['React.js', 'Firebase Auth', 'Tailwind CSS', 'DaisyUI', 'Lucide Icons', 'Vite', 'Netlify'],
    live: 'https://thriving-hamster-fc7ee4.netlify.app/',
    git: 'https://github.com/DevAnikRoy/app-store',
    fullDescription:
      'AppStore Platform lets users browse, install, and review apps with a sleek SPA interface.',
    challenges: ['Handling dynamic app categories.', 'Ensuring smooth authentication flow.'],
    improvements: ['Add personalized app recommendations.', 'Enable offline mode.'],
    type: 'Full Stack Web App',
    duration: '2 months',
    aliases: ['appstore', 'app store'],
    featured: true,
  },
  {
    id: 4,
    num: '04',
    title: 'ApnaKey Partner',
    desc: 'A Webflow marketing site for hosts who list events and activities, take bookings, and get paid from one hub.',
    image: apnakeyImg,
    tech: ['Webflow', 'CMS', 'Interactions', 'Responsive Design', 'SEO'],
    live: 'https://apnakey-partner.webflow.io/',
    git: null,
    fullDescription:
      'ApnaKey Partner is a conversion-focused Webflow site for event and activity hosts. It explains how listing, discovery, check-in, and payouts sit in one platform — sports, nightlife, classes, venues, and more — with product sections, pricing, and demo CTAs built in Webflow CMS.',
    challenges: [
      'Translating a dense SaaS product into a clear host-facing story without crowding the fold.',
      'Building a bento-style category grid and dashboard visuals that stay sharp from desktop down to phone.',
      'Structuring CMS content so product, pricing, and FAQ blocks stay editable after launch.',
    ],
    improvements: [
      'Connect live host testimonials and case studies through Webflow CMS.',
      'Add localized landing pages for new markets as ApnaKey expands.',
    ],
    type: 'Webflow Website',
    duration: '4 weeks',
    aliases: ['apnakey', 'apna key'],
    featured: true,
  },
  {
    id: 5,
    num: '05',
    title: 'Human Studio',
    desc: 'A scroll-driven Webflow site for a Cape Town creative studio covering web, branding, content, and social.',
    image: humanStudioImg,
    tech: ['Webflow', 'GSAP-style Interactions', 'CMS', 'Motion', 'Responsive Design'],
    live: 'https://human-studio-website.webflow.io/',
    git: null,
    fullDescription:
      'Human Studio is a Cape Town production studio site built in Webflow. The build leans on scroll-reveal motion, selected work, services, pricing, and a human-first brand voice — web design, branding, content, and social — for a studio that partners with brands like ASICS, Checkers, and The Economist.',
    challenges: [
      'Choreographing scroll reveals and showreel motion without hurting load time on mobile.',
      'Laying out case-study and partner grids that feel editorial rather than template-like.',
      'Keeping long-form studio copy readable while the page stays visually bold.',
    ],
    improvements: [
      'Wire a live project CMS so new case studies publish without a designer pass.',
      'Add a lighter motion mode for reduced-motion preferences.',
    ],
    type: 'Webflow Website',
    duration: '5 weeks',
    aliases: ['human studio', 'humanstudio'],
    featured: true,
  },
  {
    id: 6,
    num: '06',
    title: 'Airborne Solutions',
    desc: 'A Webflow site for aircraft sales, ferry flights, rentals, and management — catalog, listings, and trust stats.',
    image: airborneImg,
    tech: ['Webflow', 'CMS', 'Catalog Layout', 'Responsive Design', 'SEO'],
    live: 'https://airborne-v2.webflow.io/',
    git: null,
    fullDescription:
      'Airborne Solutions is an aviation company site built in Webflow. It covers buying, selling, ferry flights, rentals, and aircraft management, with a CMS-driven aircraft catalog, featured listings, and proof stats for asset value, fleet, and countries served.',
    challenges: [
      'Designing a listing card system that can hold mixed aircraft data — hours, engine type, location, and price.',
      'Making a premium aviation brand feel trustworthy without looking like a generic brokerage template.',
      'Keeping catalog and detail layouts usable on small screens with dense spec data.',
    ],
    improvements: [
      'Add filters and search on the aircraft catalog via CMS fields.',
      'Connect enquiry forms to listing-specific aircraft data.',
    ],
    type: 'Webflow Website',
    duration: '4 weeks',
    aliases: ['airborne', 'aviation'],
    featured: true,
  },
  {
    id: 7,
    num: '07',
    title: 'HouseMax Funding',
    desc: 'A Webflow site for a nationwide hard-money lender — DSCR, fix & flip, and construction loan products.',
    image: housemaxImg,
    tech: ['Webflow', 'CMS', 'Lead Forms', 'SEO', 'Responsive Design'],
    live: 'https://house-max-funding.webflow.io/',
    git: null,
    fullDescription:
      'HouseMax Funding is a direct private-lender site built in Webflow. It presents fix & flip, DSCR rental, ground-up construction, and instant quote flows, plus nationwide market coverage, team bios, and high-intent lead forms for investors who need capital fast.',
    challenges: [
      'Turning a heavy lending offer into a clear product story without burying the rate-quote CTA.',
      'Building long-form trust sections — stats, markets, testimonials — that still scan on mobile.',
      'Structuring multi-step pre-qualification forms in Webflow with validation and confirmation states.',
    ],
    improvements: [
      'Connect the rapid rate quote form to a CRM or webhook for faster follow-up.',
      'Add market-specific landing pages for top metros.',
    ],
    type: 'Webflow Website',
    duration: '5 weeks',
    aliases: ['housemax', 'house max'],
    featured: true,
  },
  {
    id: 8,
    num: '08',
    title: 'Between',
    desc: 'A Norwegian field-service OS site in Webflow — sales, planning, invoicing, and ops in one product story.',
    image: betweenImg,
    tech: ['Webflow', 'CMS', 'Localization', 'Interactions', 'Responsive Design'],
    live: 'https://between-new.webflow.io/',
    git: null,
    fullDescription:
      'Between is a Webflow marketing site for a Norwegian operating system built for field-service businesses. The page walks from first contact to completed job to invoice, with industry modules, automation, and demo CTAs — written for operators who work out at the customer, not at a desk.',
    challenges: [
      'Presenting a dense B2B product (50+ modules) without turning the homepage into a feature dump.',
      'Handling Norwegian copy, long compound words, and bilingual fragments in a tight type system.',
      'Building industry and FAQ sections that stay CMS-editable as the product grows.',
    ],
    improvements: [
      'Add industry landing pages generated from CMS collections.',
      'Tighten the demo funnel with calendar embeds and localized proof.',
    ],
    type: 'Webflow Website',
    duration: '4 weeks',
    aliases: ['between'],
    featured: true,
  },
];

export default PROJECTS;
