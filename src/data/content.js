// ─── Real dental clinic services ─────────────────────────────────────────────
export const RITUALS = [
  {
    id: '01',
    title: 'Professional Teeth Whitening',
    subtitle: 'In-Office Zoom® Whitening',
    duration: '60 min',
    price: 350,
    index: 'Up to 8 shades lighter',
    tag: 'Cosmetic',
  },
  {
    id: '02',
    title: 'Porcelain Veneers',
    subtitle: 'Ultra-thin Smile Restoration',
    duration: '2 × 90 min',
    price: 980,
    index: 'Per tooth, all-ceramic',
    tag: 'Restorative',
  },
  {
    id: '03',
    title: 'Dental Implant Placement',
    subtitle: 'Titanium Osseointegration',
    duration: '90 min',
    price: 2400,
    index: '98.2% 10-year success rate',
    tag: 'Implantology',
  },
  {
    id: '04',
    title: 'Invisalign® Clear Aligners',
    subtitle: 'Full Orthodontic Course',
    duration: '12–18 months',
    price: 4200,
    index: 'Certified Diamond Provider',
    tag: 'Orthodontics',
  },
];

// ─── Clinical team ────────────────────────────────────────────────────────────
export const STATIONS = [
  {
    id: 1,
    name: 'Dr. Sarah Mitchell',
    role: 'Cosmetic & Restorative Dentist',
    years: '16 yrs',
    specialty: 'Smile Makeovers · Veneers',
    rotation: Math.PI / 4,
    camera: [0.8, 1.3, 3.8],
  },
  {
    id: 2,
    name: 'Dr. James Okafor',
    role: 'Oral & Maxillofacial Surgeon',
    years: '12 yrs',
    specialty: 'Implants · Bone Grafting',
    rotation: (2 * Math.PI) / 3,
    camera: [1.2, 1.5, 3.2],
  },
  {
    id: 3,
    name: 'Dr. Priya Nair',
    role: 'Orthodontist — BDS, MOrth',
    years: '10 yrs',
    specialty: 'Invisalign · Fixed Braces',
    rotation: (4 * Math.PI) / 3,
    camera: [-0.5, 2.2, 3.4],
  },
  {
    id: 4,
    name: 'Dr. Tom Hargreaves',
    role: 'Periodontist & Implant Specialist',
    years: '14 yrs',
    specialty: 'Gum Therapy · Bone Restoration',
    rotation: Math.PI * 1.85,
    camera: [0, 1.2, 4.2],
  },
];

// ─── Scroll chapter callouts ──────────────────────────────────────────────────
export const CHAPTERS = [
  {
    id: '01',
    title: 'Digital Smile Design',
    body: 'We map your facial geometry and lip dynamics with 3D scanning software to preview your new smile before a single tooth is touched.',
    tag: 'Technology',
  },
  {
    id: '02',
    title: 'Pain-Free Treatment',
    body: 'Computer-controlled WAND anaesthesia delivers local anaesthetic so slowly and precisely that most patients feel nothing at all.',
    tag: 'Patient Comfort',
  },
  {
    id: '03',
    title: 'Same-Day Crowns',
    body: 'Our in-house CEREC® milling unit produces all-ceramic crowns, inlays and veneers in a single appointment — no temporary restorations.',
    tag: 'CEREC Technology',
  },
];

export const TIME_SLOTS = ['09:00', '10:00', '11:30', '14:00', '15:30', '17:00'];

export function buildDayCarousel(count = 14) {
  const days = [];
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  for (let i = 1; i <= count; i += 1) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    days.push({
      key: d.toISOString().slice(0, 10),
      weekday: d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
      day: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    });
  }
  return days;
}
