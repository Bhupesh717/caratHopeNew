'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Diamond,
  CircleDot,
  Gem,
  Sparkles,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Check,
  ArrowRight,
  Instagram,
  MessageCircle,
} from 'lucide-react';
import Link from 'next/link';

/* ─── Types ─────────────────────────────────────── */
type Service = { id: string; label: string; duration: string; desc: string; icon: React.ReactNode };
type Step = 'service' | 'datetime' | 'details' | 'done';

/* ─── Data ───────────────────────────────────────── */
const SERVICES: Service[] = [
  {
    id: 'engagement',
    label: 'Engagement Ring',
    duration: '60 min',
    desc: 'Find your perfect center diamond and ring setting with our experts.',
    icon: <Diamond className="w-6 h-6" />,
  },
  {
    id: 'wedding',
    label: 'Wedding Band',
    duration: '45 min',
    desc: 'Discover bands that complement your style and your partner\'s.',
    icon: <CircleDot className="w-6 h-6" />,
  },
  {
    id: 'fine',
    label: 'Fine Jewelry & Gifts',
    duration: '45 min',
    desc: 'Explore necklaces, bracelets, earrings and more from our collections.',
    icon: <Gem className="w-6 h-6" />,
  },
  {
    id: 'bespoke',
    label: 'Bespoke Creation',
    duration: '90 min',
    desc: 'Begin the journey of designing a completely one-of-a-kind piece.',
    icon: <Sparkles className="w-6 h-6" />,
  },
];

const TIME_SLOTS = [
  '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM',  '2:00 PM',  '3:00 PM',
  '4:00 PM',  '5:00 PM',
];

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

/* ─── Step indicator ─────────────────────────────── */
const STEPS: { key: Step; label: string }[] = [
  { key: 'service',  label: 'Service'  },
  { key: 'datetime', label: 'Date & Time' },
  { key: 'details',  label: 'Your Details'  },
  { key: 'done',     label: 'Confirm'   },
];

function StepBar({ current }: { current: Step }) {
  const idx = STEPS.findIndex(s => s.key === current);
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {STEPS.map((s, i) => {
        const done    = i < idx;
        const active  = i === idx;
        return (
          <div key={s.key} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all duration-300
                ${done   ? 'bg-emerald-dark border-emerald-dark text-white'   : ''}
                ${active ? 'bg-gold-primary border-gold-primary text-white'   : ''}
                ${!done && !active ? 'bg-white border-slate-200 text-slate-400' : ''}
              `}>
                {done ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-[9px] uppercase tracking-[0.12em] font-medium whitespace-nowrap
                ${active ? 'text-gold-primary' : done ? 'text-emerald-dark' : 'text-slate-400'}
              `}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-16 sm:w-24 h-px mx-1 mb-5 transition-colors duration-300 ${i < idx ? 'bg-emerald-dark' : 'bg-slate-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Mini Calendar ──────────────────────────────── */
function MiniCalendar({ selected, onSelect }: { selected: Date | null; onSelect: (d: Date) => void }) {
  const today = new Date();
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prev = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); };
  const next = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); };

  const isDisabled = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    return d < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  };

  const isSelected = (day: number) =>
    selected &&
    selected.getDate() === day &&
    selected.getMonth() === viewMonth &&
    selected.getFullYear() === viewYear;

  const isToday = (day: number) =>
    day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();

  return (
    <div className="bg-white border border-slate-100 p-5 select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prev} className="p-1.5 hover:bg-slate-50 transition-colors rounded">
          <ChevronLeft className="w-4 h-4 text-slate-500" />
        </button>
        <span className="text-sm font-semibold text-emerald-dark tracking-wide">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button onClick={next} className="p-1.5 hover:bg-slate-50 transition-colors rounded">
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS.map(d => (
          <div key={d} className="text-center text-[10px] font-semibold text-slate-400 uppercase py-1">{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const disabled = isDisabled(day);
          const sel      = isSelected(day);
          const tod      = isToday(day);
          return (
            <button
              key={day}
              disabled={disabled}
              onClick={() => onSelect(new Date(viewYear, viewMonth, day))}
              className={`mx-auto w-8 h-8 flex items-center justify-center text-xs rounded-full transition-all duration-200
                ${sel       ? 'bg-emerald-dark text-white font-semibold'            : ''}
                ${!sel && tod ? 'border border-gold-primary text-gold-primary font-semibold' : ''}
                ${!sel && !tod && !disabled ? 'text-slate-700 hover:bg-[#FAF6EE]'    : ''}
                ${disabled  ? 'text-slate-200 cursor-not-allowed'                   : 'cursor-pointer'}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────── */
export default function BookAppointmentPage() {
  const [step, setStep]             = useState<Step>('service');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate]   = useState<Date | null>(null);
  const [selectedTime, setSelectedTime]   = useState<string | null>(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', message: '' });
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  /* helpers */
  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.firstName.trim()) e.firstName = 'Required';
    if (!form.lastName.trim())  e.lastName  = 'Required';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email required';
    if (!form.phone.trim() || form.phone.length < 10) e.phone = 'Valid phone required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) setStep('done');
  };

  /* animation wrapper */
  const slide = {
    initial: { opacity: 0, x: 32 },
    animate: { opacity: 1, x: 0 },
    exit:    { opacity: 0, x: -32 },
    transition: { duration: 0.35, ease: 'easeInOut' as const },
  };

  return (
    <div className="min-h-screen bg-[#FAF6EE]">

      {/* ── Page Hero ── */}
      <div className="bg-emerald-dark pt-20 pb-16 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #D4A24C 0%, transparent 50%), radial-gradient(circle at 80% 50%, #D4A24C 0%, transparent 50%)' }} />
        <p className="text-[10px] tracking-[0.3em] uppercase text-gold-primary mb-3 font-semibold">CaratHope Studio</p>
        <h1 className="font-serif text-3xl md:text-5xl text-white mb-4 drop-shadow">Book an Appointment</h1>
        <div className="h-px w-16 bg-gold-primary/60 mx-auto mb-4" />
        <p className="text-slate-300 text-sm max-w-md mx-auto leading-relaxed">
          A complimentary, one-on-one session with our master jewelers — in-store or virtual.
        </p>
      </div>

      {/* ── Body ── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10">

        {/* LEFT — form card */}
        <div className="bg-white border border-slate-100 shadow-sm p-6 sm:p-10">
          {step !== 'done' && <StepBar current={step} />}

          <AnimatePresence mode="wait">

            {/* ── STEP 1: Service ── */}
            {step === 'service' && (
              <motion.div key="service" {...slide}>
                <h2 className="text-xs uppercase tracking-[0.25em] text-slate-400 mb-1">Step 1</h2>
                <h3 className="font-serif text-2xl text-emerald-dark mb-8">Select a Service</h3>
                <div className="space-y-4">
                  {SERVICES.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedService(s)}
                      className={`w-full text-left flex items-center gap-5 p-5 border transition-all duration-200
                        ${selectedService?.id === s.id
                          ? 'border-emerald-dark bg-emerald-dark/[0.03] ring-1 ring-emerald-dark'
                          : 'border-slate-100 hover:border-slate-300 bg-white'}
                      `}
                    >
                      <div className={`shrink-0 w-12 h-12 flex items-center justify-center
                        ${selectedService?.id === s.id ? 'text-emerald-dark' : 'text-gold-primary'}`}>
                        {s.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-0.5">
                          <span className="font-semibold text-sm text-slate-800">{s.label}</span>
                          <span className="text-[10px] tracking-widest uppercase text-slate-400 border border-slate-200 px-2 py-0.5">{s.duration}</span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
                      </div>
                      {selectedService?.id === s.id && (
                        <Check className="shrink-0 w-5 h-5 text-emerald-dark" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="flex justify-end mt-8">
                  <button
                    disabled={!selectedService}
                    onClick={() => setStep('datetime')}
                    className="inline-flex items-center gap-2 bg-emerald-dark text-white px-8 py-3.5 text-xs tracking-[0.18em] uppercase font-semibold hover:bg-[#0d4f3b] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: Date & Time ── */}
            {step === 'datetime' && (
              <motion.div key="datetime" {...slide}>
                <h2 className="text-xs uppercase tracking-[0.25em] text-slate-400 mb-1">Step 2</h2>
                <h3 className="font-serif text-2xl text-emerald-dark mb-8">Select Date & Time</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <MiniCalendar selected={selectedDate} onSelect={setSelectedDate} />

                  <div>
                    <p className="text-xs uppercase tracking-widest text-slate-400 mb-4">
                      {selectedDate ? formatDate(selectedDate) : 'Choose a date first'}
                    </p>
                    {selectedDate ? (
                      <div className="grid grid-cols-2 gap-2">
                        {TIME_SLOTS.map(t => (
                          <button
                            key={t}
                            onClick={() => setSelectedTime(t)}
                            className={`py-2.5 text-xs font-medium tracking-wide border transition-all duration-200
                              ${selectedTime === t
                                ? 'bg-emerald-dark text-white border-emerald-dark'
                                : 'border-slate-200 text-slate-600 hover:border-emerald-dark hover:text-emerald-dark bg-white'}
                            `}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="h-40 flex items-center justify-center border border-dashed border-slate-200">
                        <p className="text-xs text-slate-400 tracking-wider">Pick a date to see available slots</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <button onClick={() => setStep('service')} className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-emerald-dark tracking-widest uppercase transition-colors">
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    disabled={!selectedDate || !selectedTime}
                    onClick={() => setStep('details')}
                    className="inline-flex items-center gap-2 bg-emerald-dark text-white px-8 py-3.5 text-xs tracking-[0.18em] uppercase font-semibold hover:bg-[#0d4f3b] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 3: Details ── */}
            {step === 'details' && (
              <motion.div key="details" {...slide}>
                <h2 className="text-xs uppercase tracking-[0.25em] text-slate-400 mb-1">Step 3</h2>
                <h3 className="font-serif text-2xl text-emerald-dark mb-8">Your Details</h3>

                {/* Summary pill */}
                <div className="flex flex-wrap gap-3 mb-8">
                  {[selectedService?.label, selectedDate ? formatDate(selectedDate) : '', selectedTime].filter(Boolean).map((v, i) => (
                    <span key={i} className="text-[10px] tracking-[0.15em] uppercase border border-emerald-dark/30 text-emerald-dark px-3 py-1.5">{v}</span>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {([
                    { id: 'firstName', label: 'First Name', type: 'text', placeholder: 'Ananya' },
                    { id: 'lastName',  label: 'Last Name',  type: 'text', placeholder: 'Sharma' },
                    { id: 'email',     label: 'Email Address', type: 'email', placeholder: 'you@example.com', full: true },
                    { id: 'phone',     label: 'Phone Number',  type: 'tel',   placeholder: '+91 98765 43210', full: true },
                  ] as { id: keyof typeof form; label: string; type: string; placeholder: string; full?: boolean }[]).map(f => (
                    <div key={f.id} className={f.full ? 'sm:col-span-2' : ''}>
                      <label className="block text-[10px] uppercase tracking-[0.18em] font-semibold text-slate-500 mb-2">{f.label}</label>
                      <input
                        type={f.type}
                        placeholder={f.placeholder}
                        value={form[f.id]}
                        onChange={e => setForm(p => ({ ...p, [f.id]: e.target.value }))}
                        className={`w-full border-b bg-transparent pb-2 pt-1 text-sm text-slate-800 placeholder:text-slate-300 outline-none focus:border-emerald-dark transition-colors
                          ${errors[f.id] ? 'border-red-400' : 'border-slate-200'}`}
                      />
                      {errors[f.id] && <p className="text-red-400 text-[10px] mt-1">{errors[f.id]}</p>}
                    </div>
                  ))}
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] uppercase tracking-[0.18em] font-semibold text-slate-500 mb-2">Special Requests <span className="normal-case tracking-normal text-slate-400 font-normal">(optional)</span></label>
                    <textarea
                      rows={3}
                      placeholder="Tell us anything that would help us prepare for your visit…"
                      value={form.message}
                      onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                      className="w-full border border-slate-200 bg-transparent p-3 text-sm text-slate-800 placeholder:text-slate-300 outline-none focus:border-emerald-dark transition-colors resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <button onClick={() => setStep('datetime')} className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-emerald-dark tracking-widest uppercase transition-colors">
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="inline-flex items-center gap-2 bg-emerald-dark text-white px-8 py-3.5 text-xs tracking-[0.18em] uppercase font-semibold hover:bg-[#0d4f3b] transition-colors"
                  >
                    <Calendar className="w-4 h-4" /> Book Appointment
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── DONE ── */}
            {step === 'done' && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
                className="text-center py-10">
                <div className="w-16 h-16 rounded-full bg-emerald-dark/10 flex items-center justify-center mx-auto mb-6">
                  <Check className="w-8 h-8 text-emerald-dark" />
                </div>
                <h3 className="font-serif text-3xl text-emerald-dark mb-3">You're Booked!</h3>
                <div className="h-px w-12 bg-gold-primary/50 mx-auto mb-5" />
                <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed mb-8">
                  Thank you, <strong>{form.firstName}</strong>. We've noted your appointment for{' '}
                  <strong>{selectedService?.label}</strong> on{' '}
                  <strong>{selectedDate ? formatDate(selectedDate) : ''}</strong> at <strong>{selectedTime}</strong>.
                  A confirmation will be sent to <strong>{form.email}</strong>.
                </p>
                <Link href="/" className="inline-flex items-center gap-2 bg-emerald-dark text-white px-8 py-3.5 text-xs tracking-[0.18em] uppercase font-semibold hover:bg-[#0d4f3b] transition-colors">
                  Back to Home
                </Link>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* RIGHT — contact sidebar */}
        <aside className="space-y-6">

          {/* Studio Info */}
          <div className="bg-emerald-dark text-white p-7">
            <p className="text-[10px] tracking-[0.3em] uppercase text-gold-primary mb-3 font-semibold">Our Studio</p>
            <h4 className="font-serif text-xl mb-5">Visit Us in Jaipur</h4>

            <ul className="space-y-5 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-gold-primary" />
                <a
                  href="https://www.google.com/maps/search/10%2F523+Malviya+Nagar+Road+Jaipur+302017"
                  target="_blank" rel="noopener noreferrer"
                  className="text-slate-300 hover:text-white transition-colors leading-relaxed"
                >
                  10/523 Malviya Nagar Road<br />Jaipur 302017, Rajasthan
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 shrink-0 text-gold-primary" />
                <a href="tel:+918824700161" className="text-slate-300 hover:text-white transition-colors">+91 (882) 470-0161</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 shrink-0 text-gold-primary" />
                <a href="mailto:hello@carathope.in" className="text-slate-300 hover:text-white transition-colors">hello@carathope.in</a>
              </li>
              <li className="flex items-center gap-3">
                <MessageCircle className="w-4 h-4 shrink-0 text-gold-primary" />
                <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer"
                  className="text-slate-300 hover:text-white transition-colors">WhatsApp Us</a>
              </li>
            </ul>

            <div className="border-t border-white/10 mt-6 pt-5">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-3">Studio Hours</p>
              <ul className="text-xs text-slate-300 space-y-1.5">
                <li className="flex justify-between"><span>Mon – Sat</span><span className="text-white font-medium">10:00 AM – 7:00 PM</span></li>
                <li className="flex justify-between"><span>Sunday</span><span className="text-white font-medium">By Appointment</span></li>
              </ul>
            </div>
          </div>

          {/* Reach out directly */}
          <div className="bg-white border border-slate-100 p-7">
            <p className="text-[10px] tracking-[0.25em] uppercase text-slate-400 mb-3 font-semibold">Prefer to Talk?</p>
            <p className="text-sm text-slate-500 leading-relaxed mb-5">
              Call or message us directly and we'll schedule your visit in minutes.
            </p>
            <a href="tel:+918824700161"
              className="flex items-center justify-center gap-2 w-full border border-emerald-dark text-emerald-dark hover:bg-emerald-dark hover:text-white py-3 text-xs tracking-[0.18em] uppercase font-semibold transition-colors duration-300 mb-3">
              <Phone className="w-3.5 h-3.5" /> Call Now
            </a>
            <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full border border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white py-3 text-xs tracking-[0.18em] uppercase font-semibold transition-colors duration-300">
              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
            </a>
          </div>

          {/* Instagram */}
          <div className="bg-[#FAF6EE] border border-slate-100 p-7 text-center">
            <Instagram className="w-5 h-5 text-gold-primary mx-auto mb-3" />
            <p className="text-xs text-slate-500 mb-3 leading-relaxed">See our latest collections and behind-the-scenes craftsmanship.</p>
            <a href="https://instagram.com/carathope" target="_blank" rel="noopener noreferrer"
              className="text-[10px] tracking-[0.2em] uppercase font-semibold text-emerald-dark border-b border-emerald-dark/30 hover:border-gold-primary hover:text-gold-primary transition-colors pb-0.5">
              @carathope
            </a>
          </div>

        </aside>
      </div>
    </div>
  );
}
