/**
 * Homepage company content — the owner's refined draft (supplied 17 Nov 2026), used as working
 * copy. This is the ONLY place the company overview lives; other pages must not repeat these
 * paragraphs (Attractions lists products, Turnkey & Engineering lists stages/capabilities).
 *
 * Edit the text here. `approved` flips the preview "Awaiting owner verification" flags off; the
 * copy renders in production either way because the owner supplied it. Factual claims inside it
 * are tracked in docs/CONTENT_REVIEW.md §Claims.
 */
export const homepage = {
  approved: false,

  /** SEO — unique to the homepage. */
  seo: {
    title: 'Amusement Attractions Manufacturer & Turnkey Projects | Mega Fun Amusements',
    description:
      'Chennai-based amusement attractions manufacturer: immersive theatres, virtual reality attractions and amusement equipment, with turnkey solutions from concept to commissioning.',
  },

  /** Descriptive H1 (rendered as the hero's top line; the large hero line is a visual tagline). */
  h1: 'Amusement Attractions Manufacturer | Innovative Entertainment Solutions | Turnkey Projects',
  /** Company tagline (from the existing site). */
  tagline: 'Engineering Innovation. Creating Extraordinary Entertainment Experiences.',

  about: {
    heading: 'About Mega Fun Amusements',
    body: [
      'Mega Fun Amusements is an amusement attractions manufacturer and turnkey solutions provider based in Chennai, India. The company specialises in the design, engineering, manufacturing, installation and commissioning of amusement attractions and entertainment systems.',
      'Serving amusement parks, theme parks, shopping malls, multiplexes, Family Entertainment Centres (FECs) and other leisure destinations, we develop entertainment solutions suited to different spaces, audiences and operational requirements.',
    ],
  },

  portfolio: {
    heading: 'Our Attraction Portfolio',
    intro: 'Our product portfolio covers a diverse range of immersive and interactive entertainment experiences, including:',
    /** `categories` links a group to attraction categories (for thumbnails and links) when those are published. */
    groups: [
      {
        title: 'Immersive Theatre Systems',
        text: '3D, 5D and 7D theatres, simulation theatres and immersive cinema experiences designed to bring audiovisual entertainment and motion-based effects together.',
        categories: ['immersive-theatres'],
      },
      {
        title: 'Motion-Based Attractions',
        text: 'Hydraulic motion platforms, flying theatres and advanced motion simulation systems that create engaging, dynamic experiences.',
        categories: [],
      },
      {
        title: 'Themed Indoor Attractions',
        text: 'Haunted houses, jungle safari experiences and other themed walkthrough attractions.',
        categories: ['themed-walkthroughs'],
      },
      {
        // Owner decision 18 Nov 2026: mirror mazes, infinite rooms and infinity tunnels are Illusion Experiences.
        title: 'Illusion Experiences',
        text: 'Mirror mazes, infinite rooms, infinity tunnels and other illusion attractions.',
        categories: ['illusion-experiences'],
      },
      {
        title: 'Virtual Reality Attractions',
        text: 'The Walk VR, 9D VR equipment, VR simulators and interactive virtual reality experiences.',
        categories: ['virtual-reality'],
      },
      {
        title: 'Interactive Entertainment Machines',
        text: 'Hunter shooting games and specialised amusement and arcade attractions that bring interactive entertainment into leisure environments.',
        categories: ['interactive-games'],
      },
    ],
  },

  engineering: {
    heading: 'Engineering Expertise & Innovation',
    body: [
      'Engineering and product development are central to our approach to amusement attraction manufacturing. Our in-house technical capabilities encompass hydraulics, pneumatics, mechatronics, electronics, automation, control systems and animatronics.',
      'Bringing these disciplines together allows us to develop attractions that integrate mechanical movement, electronic control systems, audiovisual effects and interactive elements.',
      'Our in-house FRP moulding facility further supports the development and manufacture of customised attraction components, themed structures and decorative elements, providing flexibility throughout the product development process.',
    ],
  },

  turnkey: {
    heading: 'Complete Turnkey Amusement Solutions',
    body: [
      'Mega Fun Amusements supports amusement projects across the complete delivery journey, from initial concept development and attraction selection to design, engineering, manufacturing, installation, testing and commissioning.',
      'We work with customers to understand their available space, intended audience, operational requirements and project objectives, helping them identify suitable attractions and develop entertainment environments around their needs.',
    ],
  },

  closing: {
    heading: 'Creating Memorable Entertainment Experiences',
    body: [
      'We believe successful entertainment destinations bring together engaging attractions, thoughtful planning and dependable engineering.',
      'By combining attraction development, technical expertise and turnkey project capabilities, Mega Fun Amusements aims to help operators, developers and investors create distinctive entertainment spaces and memorable visitor experiences.',
    ],
  },
} as const;
