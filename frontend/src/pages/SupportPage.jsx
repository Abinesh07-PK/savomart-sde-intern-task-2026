import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { toast } from 'react-hot-toast';
import { LifeBuoy, Phone, Mail, Clock, ShieldAlert, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';

const SupportPage = () => {
  const { user } = useAuth();

  // Contact Info states
  const [contactInfo, setContactInfo] = useState({
    phone: '1800-123-5678',
    email: 'support@savomart.in',
    hours: 'Mon–Sat, 9 AM – 6 PM IST'
  });

  // Ticket Form states
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [category, setCategory] = useState('order');
  const [description, setDescription] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successTicket, setSuccessTicket] = useState(null); // stores response ref

  // Load profile pre-fills
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setContact(user.mobile_number || '');
    }
  }, [user]);

  // Load contact info
  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const response = await client.get('/api/support/contact-info');
        setContactInfo(response.data);
      } catch (err) {
        // fallback remains
      }
    };
    fetchContactInfo();
  }, []);

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!name.trim() || !contact.trim() || !description.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    setSuccessTicket(null);

    try {
      const response = await client.post('/api/support/request', {
        name,
        contact,
        issue_category: category,
        description
      });
      
      setSuccessTicket(response.data);
      setDescription(''); // clear text
      toast.success('Support ticket submitted successfully! 🎫');
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.detail || 'Unable to submit your support ticket.';
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Title */}
      <div className="flex flex-col space-y-1">
        <h1 className="text-2xl font-bold font-sans text-slate-800 tracking-tight">
          Help & Support
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Log complaints, report missing loyalty points, request refunds, or query operating hours.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* Support Info Cards (1/3 width) */}
        <div className="space-y-6 md:col-span-1">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6">
            <h3 className="font-bold text-sm text-slate-800 tracking-tight flex items-center">
              <LifeBuoy size={16} className="text-savomart-purple mr-2 stroke-[2.5]" />
              <span>Contact Channels</span>
            </h3>

            <div className="space-y-4">
              {/* Phone */}
              <div className="flex items-start space-x-3.5">
                <div className="w-9 h-9 rounded-xl bg-savomart-purple/5 border border-savomart-purple/10 flex items-center justify-center text-savomart-purple shrink-0">
                  <Phone size={16} />
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Toll Free</span>
                  <a href={`tel:${contactInfo.phone}`} className="text-xs font-bold text-slate-700 hover:text-savomart-purple transition-colors">
                    {contactInfo.phone}
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start space-x-3.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                  <Mail size={16} />
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address</span>
                  <a href={`mailto:${contactInfo.email}`} className="text-xs font-bold text-slate-700 hover:text-savomart-purple transition-colors">
                    {contactInfo.email}
                  </a>
                </div>
              </div>

              {/* Working Hours */}
              <div className="flex items-start space-x-3.5">
                <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                  <Clock size={16} />
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Business Hours</span>
                  <span className="text-xs font-bold text-slate-700">
                    {contactInfo.hours}
                  </span>
                </div>
              </div>
            </div>

            {/* Note badge */}
            <div className="bg-purple-50/50 border border-savomart-purple/5 rounded-2xl p-4 flex items-start space-x-2.5">
              <ShieldAlert size={16} className="text-savomart-purple shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-500 leading-normal">
                Prefer to chat? Click the assistant icon in the bottom right corner (💬) to converse with our Claude AI bot!
              </p>
            </div>
          </div>
        </div>

        {/* Ticket logging form (2/3 width) */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Ticket logged banner details */}
          {successTicket && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 shadow-sm flex items-start space-x-4 animate-scale-up">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center shrink-0">
                <CheckCircle2 size={20} />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-extrabold text-emerald-950 flex items-center">
                  <span>Support Request Logged!</span>
                  <span className="ml-2 bg-emerald-100 text-emerald-800 text-[9px] px-2 py-0.5 rounded font-extrabold uppercase">
                    Ref: SAVO-{String(successTicket.id).padStart(4, '0')}
                  </span>
                </h3>
                <p className="text-xs text-emerald-800 leading-normal">
                  {successTicket.message}
                </p>
              </div>
            </div>
          )}

          {/* Form container */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
            <h3 className="font-bold text-sm text-slate-800 tracking-tight mb-6">
              Submit a Help Request
            </h3>

            <form onSubmit={handleSubmitTicket} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Arjun Kumar"
                    className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-savomart-purple focus:border-transparent transition-all"
                  />
                </div>

                {/* Contact */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Contact Phone/Email
                  </label>
                  <input
                    type="text"
                    required
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="+91 99999 99999"
                    className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-savomart-purple focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Issue Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-savomart-purple focus:border-transparent transition-all"
                >
                  <option value="order">Order Issues / Missing Items</option>
                  <option value="points">Missing Loyalty Points</option>
                  <option value="refund">Refund Queries</option>
                  <option value="store">Store Specific Complaint</option>
                  <option value="other">General Inquiries</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Explain the Issue
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide details about your query here..."
                  className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-savomart-purple focus:border-transparent transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-3 bg-savomart-purple hover:bg-savomart-darkPurple text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Logging ticket...</span>
                  </>
                ) : (
                  <span>Submit Ticket</span>
                )}
              </button>
            </form>
          </div>
        </div>

      </div>

    </div>
  );
};

export default SupportPage;
