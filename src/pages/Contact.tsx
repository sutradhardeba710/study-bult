import React, { useState, useRef, useEffect } from 'react';
import { db } from '../services/firebaseDb';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { Mail, Clock, HelpCircle, Send, MessageSquare, User, AtSign, CheckCircle2, ArrowRight, Zap, ChevronDown, Globe, Wrench, UserCircle, Lightbulb, AlertTriangle, MoreHorizontal } from 'lucide-react';

const TOPICS: { label: string; icon: React.ElementType; color: string }[] = [
  { label: 'General Inquiry', icon: Globe, color: 'text-blue-500 bg-blue-50' },
  { label: 'Technical Support', icon: Wrench, color: 'text-orange-500 bg-orange-50' },
  { label: 'Account Issues', icon: UserCircle, color: 'text-red-500 bg-red-50' },
  { label: 'Feature Request', icon: Lightbulb, color: 'text-yellow-500 bg-yellow-50' },
  { label: 'Report a Problem', icon: AlertTriangle, color: 'text-rose-500 bg-rose-50' },
  { label: 'Other', icon: MoreHorizontal, color: 'text-gray-500 bg-gray-100' },
];

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [topicOpen, setTopicOpen] = useState(false);
  const topicRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (topicRef.current && !topicRef.current.contains(e.target as Node)) setTopicOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectedTopic = TOPICS.find(t => t.label === formData.subject) || null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'contact_messages'), {
        ...formData,
        status: 'unread',
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
      toast.success("Message sent! We'll get back to you soon.");
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast.error('Something went wrong. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero Banner ── */}
      <div className="relative bg-gradient-to-br from-primary-700 via-primary-600 to-indigo-500 overflow-hidden">
        {/* dot grid */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '28px 28px' }} />
        {/* blur blobs */}
        <div className="absolute -top-10 -right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-56 h-56 bg-indigo-800/30 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          {/* badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/20 text-white/90 text-xs font-semibold mb-6">
            <Zap className="w-3.5 h-3.5 fill-yellow-300 text-yellow-300" />
            Usually respond within 24 hours
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
            Let's Start a<br className="hidden sm:block" /> Conversation
          </h1>
          <p className="text-base sm:text-lg text-white/75 max-w-xl mx-auto leading-relaxed">
            Have a question, suggestion, or just want to say hello?<br className="hidden sm:block" />
            We're always happy to hear from our users.
          </p>

          {/* Quick stats */}
          <div className="mt-10 grid grid-cols-3 gap-3 max-w-sm sm:max-w-md mx-auto">
            {[
              { value: '<24h', label: 'Response' },
              { value: '98%', label: 'Satisfaction' },
              { value: '24/7', label: 'Support' },
            ].map(s => (
              <div key={s.label} className="bg-white/10 border border-white/20 rounded-2xl p-3 sm:p-4 backdrop-blur-sm">
                <p className="text-xl sm:text-2xl font-bold text-white">{s.value}</p>
                <p className="text-[10px] sm:text-xs text-white/60 font-medium mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* ── Left sidebar ── */}
          <div className="lg:col-span-2 flex flex-col gap-4">

            {/* Contact Details */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-5">Contact Details</h2>
              <div className="space-y-5">
                <div className="flex items-start gap-3.5 group">
                  <div className="mt-0.5 w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-100 transition-colors">
                    <Mail className="w-4 h-4 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email</p>
                    <a href="mailto:support@study-volte.site" className="text-sm font-semibold text-gray-800 hover:text-primary-600 transition-colors break-all">
                      support@study-volte.site
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 group">
                  <div className="mt-0.5 w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Hours</p>
                    <p className="text-sm font-semibold text-gray-800">Mon–Fri, 9 AM – 6 PM IST</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 group">
                  <div className="mt-0.5 w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-100 transition-colors">
                    <HelpCircle className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Resources</p>
                    <div className="flex items-center gap-3 flex-wrap mt-0.5">
                      {['Help Center', 'FAQ'].map(link => (
                        <a key={link} href={`/${link.toLowerCase().replace(' ', '-')}`}
                          className="text-sm font-semibold text-primary-600 hover:text-primary-700 inline-flex items-center gap-0.5 group/l">
                          {link}
                          <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover/l:opacity-100 group-hover/l:translate-x-0 transition-all" />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* What to expect */}
            <div className="bg-gradient-to-br from-primary-700 to-primary-500 rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="absolute -top-5 -right-5 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-5 -left-5 w-16 h-16 bg-indigo-900/30 rounded-full blur-2xl" />
              <div className="relative z-10">
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center mb-4">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-sm font-bold mb-3">What to expect</h3>
                <ul className="space-y-2.5">
                  {[
                    'Acknowledgement within 1 hour',
                    'Full response within 24 hours',
                    'Follow-up on complex issues',
                  ].map(item => (
                    <li key={item} className="flex items-start gap-2 text-sm text-white/80">
                      <CheckCircle2 className="w-4 h-4 text-emerald-300 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* ── Form ── */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 h-full">

              {submitted ? (
                /* ── Success state ── */
                <div className="flex flex-col items-center justify-center h-full py-10 text-center">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    </div>
                    <span className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-30" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Message Received!</h2>
                  <p className="text-gray-500 max-w-xs leading-relaxed mb-8 text-sm">
                    Thanks for reaching out. We'll get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors text-sm shadow-lg shadow-primary-500/20"
                  >
                    <Send className="w-4 h-4" />
                    Send Another Message
                  </button>
                </div>
              ) : (
                /* ── Form ── */
                <form onSubmit={handleSubmit}>
                  {/* Form header */}
                  <div className="flex items-center gap-3 mb-7">
                    <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center flex-shrink-0">
                      <Send className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-900">Send a Message</h2>
                      <p className="text-xs text-gray-400">All fields are required</p>
                    </div>
                  </div>

                  {/* Name + Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1.5">
                      <label htmlFor="name" className="block text-sm font-semibold text-gray-700">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="John Doe"
                          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="email" className="block text-sm font-semibold text-gray-700">Email Address</label>
                      <div className="relative">
                        <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="john@example.com"
                          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Topic */}
                  <div className="space-y-1.5 mb-4" ref={topicRef}>
                    <label className="block text-sm font-semibold text-gray-700">Topic</label>
                    <div className="relative">
                      {/* Trigger button */}
                      <button
                        type="button"
                        onClick={() => setTopicOpen(o => !o)}
                        className={`w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 border rounded-xl text-sm transition-all ${topicOpen ? 'border-primary-500 ring-2 ring-primary-500/20 bg-white' : 'border-gray-200 hover:border-gray-300'}`}
                      >
                        {selectedTopic ? (
                          <span className="flex items-center gap-2">
                            <span className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${selectedTopic.color}`}>
                              <selectedTopic.icon className="w-3.5 h-3.5" />
                            </span>
                            <span className="font-medium text-gray-800">{selectedTopic.label}</span>
                          </span>
                        ) : (
                          <span className="text-gray-400">Select a topic…</span>
                        )}
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${topicOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Dropdown panel */}
                      {topicOpen && (
                        <div className="absolute z-20 left-0 right-0 top-[calc(100%+6px)] bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
                          <div className="p-1.5">
                            {TOPICS.map(topic => (
                              <button
                                key={topic.label}
                                type="button"
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, subject: topic.label }));
                                  setTopicOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition-all ${formData.subject === topic.label ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'}`}
                              >
                                <span className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${topic.color}`}>
                                  <topic.icon className="w-4 h-4" />
                                </span>
                                <span className="font-medium">{topic.label}</span>
                                {formData.subject === topic.label && (
                                  <CheckCircle2 className="w-4 h-4 text-primary-500 ml-auto" />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      {/* Hidden input to satisfy form validation */}
                      <input type="hidden" name="subject" value={formData.subject} required />
                    </div>
                  </div>


                  {/* Message */}
                  <div className="space-y-1.5 mb-6">
                    <label htmlFor="message" className="block text-sm font-semibold text-gray-700">Your Message</label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      required
                      placeholder="Describe your issue or question in detail…"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none"
                    />
                    <p className="text-xs text-gray-400 text-right">{formData.message.length} characters</p>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2.5 py-3 px-6 rounded-xl text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Sending…
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Message
                      </>
                    )}
                  </button>

                  <p className="text-center text-xs text-gray-400 mt-3">
                    🔒 We respect your privacy. Messages are kept confidential.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;