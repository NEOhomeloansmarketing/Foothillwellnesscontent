export const brand = {
  name: 'Foothill Wellness',
  tagline: 'Feel Better Faster',
  location: '1414 South Foothill Drive, #D, Salt Lake City, Utah 84108',
  cta: { primary: 'Call or text (801) 784-0095', phone: '(801) 784-0095' },
  promise: 'Your body already knows how to heal itself. Foothill Wellness helps it heal faster.',
  emotionalBullseye: 'They are not trying to become someone new. They are trying to get themselves back.',
  voice: {
    is: ['warm','confident','knowledgeable','holistic','modern','human','encouraging','non-salesy','premium but approachable'],
    avoid: ['clinical jargon','miracle-cure claims','fear-based wellness marketing','anti-doctor rants','generic spa language','pushy sales copy','treatment-first menus before outcome-first guidance'],
  },
  enemy: 'The symptom-masking model that tells people pain, fatigue, stiffness, weight gain, and decline are normal — then offers pills instead of asking what the body needs to heal.',
  guardrails: [
    "No guaranteed results or disease-treatment claims.",
    "Use supportive language: 'may help', 'can support', 'many clients report'.",
    "Encourage consultation when appropriate.",
    "Always use the official Foothill Wellness logo.",
  ],
};

export const fiveLaws = [
  { n:1, name:'It is not about you.', test:"Is this about the customer, or about us? Use 'you' more than 'we'." },
  { n:2, name:'Lead with their problem.', test:'Does this name a problem the customer already feels?' },
  { n:3, name:'Increase perceived likelihood of success.', test:'Does this build confidence with proof, testimonials, or a clear plan?' },
  { n:4, name:'Increase perceived speed to the dream outcome.', test:'Does this make the result feel closer / sooner — credibly?' },
  { n:5, name:'Increase perceived ease to the dream outcome.', test:'Does this make the first step feel simple, clear, and low-friction?' },
];

export const sequence = ['Problem','Empathy','Guide','Plan','Proof','Speed','Ease','Action'];

export const audiences = [
  { id: 'pain' as const, label: 'Pain & Inflammation', problem: 'Joint pain, stiffness, soreness, old injuries limiting daily life.' },
  { id: 'healing' as const, label: 'Healing & Recovery', problem: 'Recovering from injury, surgery, or athletic strain; wants to heal faster.' },
  { id: 'weight' as const, label: 'Weight & Body', problem: 'Wants weight loss, body composition change, confidence in their body.' },
  { id: 'energy' as const, label: 'Energy & Vitality', problem: 'Depleted, stressed, tired, inflamed, disconnected from how they want to feel.' },
];

export const offerings = [
  { cat: 'Lifestyle & Wellness', items: ['Cryotherapy','Red Light Therapy','Compression Therapy','Infrared Sauna','SECA Body Composition'] },
  { cat: 'IV Therapy & Injections', items: ['IV Drip Therapy','IV Infusions','IM / Wellness Injections','Glutathione Push','Vitamin D IM','Build-a-Bag IV'] },
  { cat: 'NAD+ Therapy', items: ['NAD+ IV','NAD+ IM'] },
  { cat: 'Ozone Therapy', items: ['Ozone IV','Ozone UBI'] },
  { cat: 'Hyperbaric Oxygen', items: ['HBOT / mHBOT'] },
  { cat: 'Medical Weight Loss & GLP-1', items: ['Semaglutide','Tirzepatide','Microdose Tirzepatide','Body composition tracking'] },
  { cat: 'Peptide Therapy', items: ['Peptides for energy, healing, recovery, vitality, body composition'] },
  { cat: 'Regenerative Wellness', items: ['Stem cell-based therapy','Regenerative infusion packages','Cellular support'] },
  { cat: 'PRP & Regenerative Aesthetics', items: ['PRP','Vampire / PRP Facial','PRP body renewal'] },
  { cat: 'Body Contouring & Toning', items: ['Emsculpt Neo','Cryoskin / Neveskin','Lymphatic drainage'] },
  { cat: 'Skin, Injectables & Aesthetics', items: ['Facials','Cryo Facial','Microneedling','Chemical Peel','Dermaplane','Botox','Dermal Fillers'] },
  { cat: 'Beauty Services', items: ['Brow/Lash Tinting','Brow Shaping/Wax','Brow Lamination','Brow Works','Ultrasonic','High Frequency'] },
];

export const testimonials = [
  { name:'Olga F.', tag:'weight', text:"I've been going here over a year for weight loss. I'm down 56 lbs, muscle up and feeling great. The nurses are top notch and have been wildly helpful." },
  { name:'Holly T.', tag:'healing', text:'Foothill has been fantastic helping me recover from ACL surgery. Several sessions in the hyperbaric chamber plus red light therapy made my recovery much easier.' },
  { name:'Rachael C.', tag:'healing', text:"I started coming while recovering from bone cancer surgery — it's been a game changer. After one cryo session I signed up for a 6-month pass. That's how powerful it was." },
  { name:'Theresa H.', tag:'pain', text:"I've been using cryotherapy and red light several times a week. My chronic pain has been significantly lessened. The staff is superb." },
  { name:'Kay C.', tag:'pain', text:'I have 3 herniated discs and arthritis in my lower back. Red light and compression therapy have done wonders. I feel like I can function again.' },
  { name:'Ethan T.', tag:'pain', text:'The cryo chamber feels amazing and really helped my back pain. The compression therapy is great for recovery.' },
  { name:'Emily L.', tag:'energy', text:'Since going regularly for red light and whole body cryo, my skin and energy levels have improved. Some old scars look better — less raised and lighter.' },
  { name:'Sara C.', tag:'energy', text:'Dealing with autoimmune symptoms and menopause is overwhelming, but the hyperbaric chamber, red light, UV IV, and NAD+ made a noticeable difference in my energy, inflammation, and well-being.' },
  { name:'Phoenix R.', tag:'energy', text:"After three treatment days I felt better than I have in years. These treatments have given me renewed energy and relief from symptoms I thought I'd live with indefinitely." },
  { name:'Desirae O.', tag:'weight', text:"Every staff member has helped me with my weight loss goals and even cheered me on. I never felt pressured and they were honest about all options." },
  { name:'Bill H.', tag:'pain', text:"I'd been suffering from lower back pain. Multiple red light sessions and a 3-minute cryo session and I'm good." },
  { name:'Eric H.', tag:'healing', text:'The red light really helped my shoulder. I hurt my AC joint skiing. First time — got in my car and thought, no way, my shoulder really does feel better already!' },
  { name:'Bailey N.', tag:'energy', text:'I needed to slow down and recover. From the moment I arrived I was so well taken care of. I felt a night/day difference after I left.' },
  { name:'Meenakshi S.', tag:'pain', text:'Two months of cryo and red light — I see improvement in my back pain and love the energy boost after cryo.' },
  { name:'Gina N.', tag:'pain', text:'The hip compression is helping my hip and back pain. I love cryo, sauna, red-light and compression — and started Emsculpt and feel great.' },
  { name:'Chris F.', tag:'energy', text:'Whole body cryo left me energized, less knee inflammation, and I slept great that night. The cryoskin facial left my face smooth and tight.' },
];

export const contentTypes = [
  { id:'ig-post', label:'Instagram Post', group:'Social Graphics', desc:'Single square graphic + caption', ratio:'1080×1080' },
  { id:'ig-carousel', label:'Instagram Carousel', group:'Social Graphics', desc:'3–7 swipeable slides + caption', ratio:'1080×1080' },
  { id:'ig-story', label:'Story / Reel Cover', group:'Social Graphics', desc:'Vertical 9:16 graphic + hook', ratio:'1080×1920' },
  { id:'reel', label:'Reel / Short Script', group:'Video', desc:'Hook + shot list + caption', ratio:'9:16' },
  { id:'flyer', label:'Flyer', group:'Print', desc:'Printable promo flyer', ratio:'8.5×11' },
  { id:'handout', label:'Handout', group:'Print', desc:'In-clinic educational one-pager', ratio:'8.5×11' },
  { id:'email', label:'Email Campaign', group:'Direct', desc:'Subject + full email body', ratio:'—' },
  { id:'sms', label:'SMS / Text Blast', group:'Direct', desc:'Short text with CTA', ratio:'—' },
  { id:'blog', label:'Blog Post', group:'Long-form', desc:'SEO article, 600–1000 words', ratio:'—' },
  { id:'ad', label:'Paid Ad', group:'Direct', desc:'Primary text, headline, description', ratio:'varies' },
];
