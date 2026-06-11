export const grades = [10, 11, 12];

export const pathwayThemes = {
  stem: {
    name: 'STEM',
    slug: 'stem',
    color: 'Blue',
    pageHref: '/subjects/stem',
    accentText: 'text-blue-700',
    badge: 'bg-blue-50 text-blue-700 ring-blue-200',
    button: 'bg-blue-600 text-white hover:bg-blue-700',
    cardRing: 'ring-blue-200',
    softBg: 'bg-blue-50',
  },
  'social-sciences': {
    name: 'Social Sciences',
    slug: 'social-sciences',
    color: 'Green',
    pageHref: '/subjects/social-sciences',
    accentText: 'text-emerald-700',
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    button: 'bg-emerald-600 text-white hover:bg-emerald-700',
    cardRing: 'ring-emerald-200',
    softBg: 'bg-emerald-50',
  },
  'arts-sports': {
    name: 'Arts & Sports',
    slug: 'arts-sports',
    color: 'Orange',
    pageHref: '/subjects/arts-sports',
    accentText: 'text-orange-700',
    badge: 'bg-orange-50 text-orange-700 ring-orange-200',
    button: 'bg-orange-600 text-white hover:bg-orange-700',
    cardRing: 'ring-orange-200',
    softBg: 'bg-orange-50',
  },
};

const sharedCompetencies = {
  stem: [
    'Designs investigations using safe laboratory and field practices.',
    'Applies mathematical and computational reasoning to solve authentic problems.',
    'Communicates evidence-based conclusions with accurate models and data displays.',
  ],
  'social-sciences': [
    'Interprets civic, economic, and geographic evidence from multiple sources.',
    'Evaluates community issues with ethical reasoning and responsible citizenship.',
    'Presents balanced arguments that connect local and global perspectives.',
  ],
  'arts-sports': [
    'Creates, performs, or constructs original work using appropriate tools and techniques.',
    'Demonstrates discipline, collaboration, safety, and fair play in practical tasks.',
    'Reflects on creative and physical performance to improve quality and wellbeing.',
  ],
};

const sharedOutcomes = {
  stem: [
    'Use inquiry, experimentation, and digital tools to investigate real-world STEM challenges.',
    'Select appropriate concepts, formulae, materials, and technologies for practical solutions.',
    'Develop readiness for STEM careers, innovation, and advanced study.',
  ],
  'social-sciences': [
    'Explain human society, governance, enterprise, and the environment using credible evidence.',
    'Make informed decisions that promote peace, sustainability, and economic wellbeing.',
    'Participate actively in community problem-solving and civic dialogue.',
  ],
  'arts-sports': [
    'Express ideas, culture, and identity through creative, technical, and physical performance.',
    'Apply design thinking, health knowledge, and craftsmanship in practical projects.',
    'Build talent pathways for creative industries, sport, construction, and home management.',
  ],
};

function buildSubject(pathway, name, description, topics) {
  return {
    name,
    slug: name
      .toLowerCase()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, ''),
    pathway,
    description,
    topicsByGrade: topics,
    competencyIndicators: sharedCompetencies[pathway],
    learningOutcomes: sharedOutcomes[pathway],
    assessmentHref: `/assessments?pathway=${pathway}&subject=${encodeURIComponent(name)}`,
  };
}

export const subjectsByPathway = {
  stem: [
    buildSubject('stem', 'Mathematics', 'Strengthens logical reasoning, modelling, statistics, and problem-solving for advanced study and daily decisions.', {
      10: ['Number patterns and algebraic expressions', 'Coordinate geometry', 'Introductory probability and statistics'],
      11: ['Functions and transformations', 'Trigonometry and vectors', 'Data analysis for investigations'],
      12: ['Calculus foundations', 'Financial mathematics', 'Mathematical modelling project'],
    }),
    buildSubject('stem', 'Physics', 'Explores matter, energy, motion, and systems through measurement, experimentation, and engineering applications.', {
      10: ['Measurements and units', 'Forces and motion', 'Energy transfer'],
      11: ['Waves and sound', 'Electricity and magnetism', 'Thermal physics'],
      12: ['Modern physics applications', 'Electronics and circuits', 'Engineering design challenge'],
    }),
    buildSubject('stem', 'Chemistry', 'Builds understanding of substances, reactions, laboratory safety, and chemical processes that improve communities.', {
      10: ['Atomic structure and bonding', 'Acids, bases, and salts', 'Separation techniques'],
      11: ['Chemical energetics', 'Organic chemistry basics', 'Rates of reaction'],
      12: ['Electrochemistry', 'Industrial chemical processes', 'Environmental chemistry'],
    }),
    buildSubject('stem', 'Biology', 'Develops inquiry into living organisms, health, ecosystems, genetics, and biotechnology.', {
      10: ['Cell structure and function', 'Nutrition and transport', 'Ecology basics'],
      11: ['Genetics and inheritance', 'Human body systems', 'Microorganisms and health'],
      12: ['Evolution and biodiversity', 'Biotechnology applications', 'Conservation project'],
    }),
    buildSubject('stem', 'Computer Science', 'Introduces computational thinking, programming, data, networks, and responsible digital innovation.', {
      10: ['Computational thinking', 'Programming fundamentals', 'Digital citizenship'],
      11: ['Data structures', 'Web and database concepts', 'Computer networks'],
      12: ['Software project management', 'Cybersecurity basics', 'AI and automation project'],
    }),
    buildSubject('stem', 'Agriculture', 'Connects plant, animal, soil, and agribusiness skills to food security and sustainable livelihoods.', {
      10: ['Soil fertility and conservation', 'Crop production practices', 'Farm tools and safety'],
      11: ['Animal production systems', 'Irrigation and water management', 'Agricultural economics'],
      12: ['Agri-enterprise project', 'Post-harvest handling', 'Climate-smart agriculture'],
    }),
  ],
  'social-sciences': [
    buildSubject('social-sciences', 'History & Citizenship', 'Examines historical change, identity, governance, rights, and responsibilities for active citizenship.', {
      10: ['Sources of history', 'Kenyan communities and identity', 'Citizenship and national values'],
      11: ['Governance and democracy', 'Conflict resolution', 'Regional integration'],
      12: ['Constitutionalism', 'Global citizenship', 'Historical inquiry project'],
    }),
    buildSubject('social-sciences', 'Geography', 'Studies places, resources, environments, and spatial patterns to support sustainable planning.', {
      10: ['Map skills', 'Weather and climate', 'Landforms and drainage'],
      11: ['Population and settlement', 'Natural resources', 'Environmental management'],
      12: ['Geographic information systems', 'Urban planning', 'Fieldwork investigation'],
    }),
    buildSubject('social-sciences', 'Economics', 'Develops economic reasoning about scarcity, markets, public policy, and household choices.', {
      10: ['Basic economic concepts', 'Demand and supply', 'Consumer choices'],
      11: ['Markets and competition', 'Money and banking', 'National income'],
      12: ['Public finance', 'International trade', 'Economic policy analysis'],
    }),
    buildSubject('social-sciences', 'Business Studies', 'Builds entrepreneurship, accounting, marketing, and management skills for responsible enterprise.', {
      10: ['Business environments', 'Entrepreneurship', 'Office and communication skills'],
      11: ['Bookkeeping and records', 'Marketing basics', 'Business ownership forms'],
      12: ['Financial statements', 'Operations management', 'Business plan project'],
    }),
    buildSubject('social-sciences', 'Christian Religious Education', 'Promotes ethical reflection, biblical literacy, values, and service in contemporary society.', {
      10: ['Creation and human dignity', 'Biblical leadership', 'Christian values'],
      11: ['Prophets and social justice', 'Life skills and morality', 'Church history'],
      12: ['Contemporary ethical issues', 'Interfaith respect', 'Community service project'],
    }),
    buildSubject('social-sciences', 'Social Studies', 'Integrates culture, civics, geography, and social inquiry for responsible community participation.', {
      10: ['Community institutions', 'Culture and diversity', 'Basic research skills'],
      11: ['Human rights and responsibilities', 'Social change', 'Media literacy'],
      12: ['Sustainable development', 'Public participation', 'Community action project'],
    }),
  ],
  'arts-sports': [
    buildSubject('arts-sports', 'Fine Art', 'Develops visual expression, design principles, art history, and portfolio-ready studio practice.', {
      10: ['Drawing and composition', 'Colour theory', 'Art appreciation'],
      11: ['Painting and mixed media', 'Printmaking', 'Visual communication'],
      12: ['Portfolio development', 'Exhibition planning', 'Community art project'],
    }),
    buildSubject('arts-sports', 'Music', 'Builds musicianship through performance, theory, composition, listening, and cultural appreciation.', {
      10: ['Rhythm and melody', 'Voice and instrument care', 'Kenyan music traditions'],
      11: ['Harmony and notation', 'Ensemble performance', 'Music technology'],
      12: ['Composition project', 'Music business basics', 'Recital preparation'],
    }),
    buildSubject('arts-sports', 'Drama & Theatre', 'Strengthens creativity, storytelling, performance, stagecraft, and critical appreciation.', {
      10: ['Improvisation and voice', 'Script reading', 'Movement and expression'],
      11: ['Play production roles', 'Directing basics', 'Costume and set design'],
      12: ['Original performance project', 'Theatre criticism', 'Festival preparation'],
    }),
    buildSubject('arts-sports', 'Physical Education', 'Promotes fitness, sport skills, health, safety, teamwork, and lifelong active living.', {
      10: ['Fitness components', 'Athletics fundamentals', 'Injury prevention'],
      11: ['Team games tactics', 'Nutrition and performance', 'Outdoor recreation'],
      12: ['Coaching and officiating', 'Personal fitness plan', 'Sports leadership project'],
    }),
    buildSubject('arts-sports', 'Home Science', 'Applies nutrition, textiles, consumer education, and household management for healthy living.', {
      10: ['Food hygiene and preparation', 'Textile care', 'Family resource management'],
      11: ['Meal planning', 'Clothing construction basics', 'Consumer choices'],
      12: ['Home enterprise project', 'Interior space planning', 'Community nutrition'],
    }),
    buildSubject('arts-sports', 'Building & Construction', 'Introduces construction materials, drawing, tools, safety, and project-based craftsmanship.', {
      10: ['Workshop safety', 'Technical drawing basics', 'Building materials'],
      11: ['Masonry and carpentry skills', 'Site preparation', 'Services and utilities'],
      12: ['Costing and project planning', 'Sustainable construction', 'Prototype build project'],
    }),
  ],
};

export const allSubjects = Object.values(subjectsByPathway).flat();

export function getSubjects({ pathway = 'all', grade = 'all' } = {}) {
  const source = pathway === 'all' ? allSubjects : subjectsByPathway[pathway] || [];

  if (grade === 'all') {
    return source;
  }

  return source.filter((subject) => Boolean(subject.topicsByGrade[grade]));
}
