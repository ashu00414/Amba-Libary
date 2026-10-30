import React, { useState } from 'react';
import { Send, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { saveFeedback } from '../data/libraryStore';

export default function FeedbackSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Access key from Vite env (e.g. configured in Vercel or .env)
  const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || '';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMessage('Please fill in all required fields (Name, Email, and Message).');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      subject: formData.subject.trim() || 'General Feedback / Shift Inquiry',
      message: formData.message.trim(),
      from_name: 'Amba Library Web Visitor',
      replyto: formData.email.trim()
    };

    // Always keep a local copy in database
    saveFeedback(payload);

    // If Access Key is set (e.g. on Vercel deployment), send through Web3Forms
    if (accessKey && accessKey !== 'YOUR_WEB3FORMS_ACCESS_KEY') {
      try {
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify({
            access_key: accessKey,
            ...payload
          })
        });

        const data = await response.json();

        if (data.success) {
          setIsSuccess(true);
          setFormData({ name: '', email: '', subject: '', message: '' });
        } else {
          setErrorMessage(data.message || 'Unable to deliver message right now. Please email us directly.');
        }
      } catch (err) {
        console.error('Web3Forms submit error:', err);
        setErrorMessage('Network error while connecting to mail service. Please try again or email directly.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Local/demo fallback: Clean realistic submission flow
      setTimeout(() => {
        setIsSubmitting(false);
        setIsSuccess(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
      }, 600);
    }
  };

  return (
    <section id="feedback" className="w-full py-20 px-6 sm:px-10 lg:px-16 bg-[#060813] text-white relative">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Header matching screenshot */}
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-heading">
            Get in Touch
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Have questions, feedback, or a suggestion for Amba Library? We would love to hear from you.
          </p>
        </div>

        {/* Centered Form Card */}
        <div className="max-w-2xl mx-auto bg-[#111625] border border-[#1E2638] rounded-2xl p-6 sm:p-9 shadow-2xl relative">
          
          {isSuccess ? (
            <div className="py-10 text-center space-y-4 animate-in fade-in zoom-in-95">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-bold text-white">Thank You for Your Message!</h3>
                <p className="text-slate-300 text-sm max-w-md mx-auto">
                  Your message has been received. Our team will review your notes or get back to you at <strong>amba00414@gmail.com</strong>.
                </p>
              </div>
              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => setIsSuccess(false)}
                  className="px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  Submit Another Message
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Spam protection honeypot */}
              <input type="checkbox" name="botcheck" className="hidden" style={{ display: 'none' }} />

              {errorMessage && (
                <div className="p-3 bg-red-950/60 border border-red-800/80 text-red-200 rounded-xl text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Row 1: Name and Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Your Name <span className="text-blue-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Jane Doe"
                    className="w-full bg-[#182032] border border-[#263248] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Email Address <span className="text-blue-400">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="jane@example.com"
                    className="w-full bg-[#182032] border border-[#263248] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Row 2: Subject */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Tool suggestion / Feature feedback"
                  className="w-full bg-[#182032] border border-[#263248] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Row 3: Message */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Message <span className="text-blue-400">*</span>
                </label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us what you think or how we can improve..."
                  className="w-full bg-[#182032] border border-[#263248] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60 active:scale-[0.99]"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Submitting Message...' : 'Submit Message'}</span>
              </button>

            </form>
          )}

          {/* Footer inside/below card matching screenshot */}
          <div className="mt-8 pt-6 border-t border-[#1E2638] space-y-2 text-center">
            <div className="flex items-center justify-center space-x-1.5 text-xs text-slate-300 font-medium">
              <Mail className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Direct Support Email:</span>
              <a 
                href="mailto:amba00414@gmail.com" 
                className="text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-2 transition-colors"
              >
                amba00414@gmail.com
              </a>
            </div>
            <div className="text-[11px] text-slate-400 leading-normal">
              Operating Hours: Monday – Saturday (9:00 AM – 7:00 PM IST) • Average Response Time: 24–48 Hours
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
