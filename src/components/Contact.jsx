import React, { useState } from 'react';
import { Mail, Phone, MessageCircle, MapPin, Send, Check } from 'lucide-react';
import emailjs from '@emailjs/browser';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const serviceId = 'service_wl3xgyq';
    const templateId = 'template_0wb8kkh';
    const publicKey = 'PajMstwQ-quitKD_5';

    const templateParams = {
      name: formData.name,
      email: formData.email,
      subject: formData.subject,
      message: formData.message,
    };

    try {
      await emailjs.send(serviceId, templateId, templateParams, publicKey);
      setIsSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('FAILED...', error);
      alert('Something went wrong. Please try again later.');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setIsSubmitted(false), 3000);
    }
  };

  const contactInfo = [
    { icon: Mail, title: 'Email', value: 'anikroy302@gmail.com', href: 'mailto:anikroy302@gmail.com' },
    { icon: Phone, title: 'Phone', value: '+8801722718821', href: 'tel:+8801722718821' },
    { icon: MessageCircle, title: 'WhatsApp', value: '+8801722718821', href: 'https://wa.me/8801722718821' },
    { icon: MapPin, title: 'Location', value: 'Dhaka, Bangladesh', href: '#' },
  ];

  const fieldClass =
    'w-full px-4 py-3.5 bg-[#110E1B] border border-[#191528] rounded-xl text-white placeholder-[#48484A] focus:border-[#7873F5]/50 focus:ring-2 focus:ring-[#7873F5]/20 focus:outline-none transition-all text-base';

  return (
    <section id="contact" className="py-10 md:py-24 pb-8">
      <div className="relative rounded-[1.75rem] md:rounded-[3rem] bg-[#0E0C17] border border-[#191528] p-6 sm:p-10 md:p-16 text-center overflow-hidden mb-8 md:mb-16">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-50%] left-[-20%] w-[100%] h-[100%] bg-[#7873F5] rounded-full blur-[120px] mix-blend-screen opacity-15" />
          <div className="absolute bottom-[-50%] right-[-20%] w-[100%] h-[100%] bg-[#EC77AB] rounded-full blur-[120px] mix-blend-screen opacity-15" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-white mb-4 md:mb-6 tracking-tight leading-tight">
            Ready to ship <br />
            <span className="grad-text">faster &amp; better?</span>
          </h2>
          <p className="text-base md:text-lg text-[#8E8E93] mb-2 leading-relaxed">
            Let&apos;s skip the endless meetings and build something real —
            an MVP sprint or a full product overhaul.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        <div className="space-y-4">
          {contactInfo.map((info) => {
            const Icon = info.icon;
            return (
              <a
                key={info.title}
                href={info.href}
                className="flex items-center p-5 rounded-2xl bg-[#0E0C17] border border-[#191528] hover:border-[#7873F5]/30 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#110E1B] border border-[#191528] flex items-center justify-center mr-4 text-[#7873F5] group-hover:scale-110 transition-transform">
                  <Icon size={20} />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm">{info.title}</h4>
                  <p className="text-[#8E8E93] text-sm">{info.value}</p>
                </div>
              </a>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6 md:p-8 rounded-3xl bg-[#0E0C17] border border-[#191528]">
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="name" className="block text-[#8E8E93] text-sm font-medium mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className={fieldClass}
                placeholder="John Doe"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-[#8E8E93] text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className={fieldClass}
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="subject" className="block text-[#8E8E93] text-sm font-medium mb-2">
              Subject
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              required
              className={fieldClass}
              placeholder="Project Discussion"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-[#8E8E93] text-sm font-medium mb-2">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              required
              rows={6}
              className={`${fieldClass} resize-none`}
              placeholder="Tell me about your project..."
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isSubmitted}
            className={`w-full py-4 px-6 rounded-2xl font-semibold transition-all flex items-center justify-center ${
              isSubmitted
                ? 'bg-emerald-500 text-white'
                : isSubmitting
                ? 'bg-[#1C1C1E] text-[#8E8E93] cursor-not-allowed'
                : 'bg-gradient-to-r from-[#7873F5] to-[#EC77AB] text-white hover:opacity-90'
            }`}
          >
            {isSubmitted ? (
              <>
                <Check size={20} className="mr-2" />
                Message Sent!
              </>
            ) : isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2" />
                Sending...
              </>
            ) : (
              <>
                <Send size={20} className="mr-2" />
                Send Message
              </>
            )}
          </button>
        </form>
      </div>
    </section>
  );
};

export default Contact;
