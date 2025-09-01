'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  GlobeAltIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const contactMethods = [
  {
    icon: EnvelopeIcon,
    title: 'Email Support',
    description: 'Get help via email within 24 hours',
    contact: 'support@kendraa.com',
    action: 'Send Email'
  },
  {
    icon: PhoneIcon,
    title: 'Phone Support',
    description: 'Speak with our team directly',
    contact: '+1 (555) 123-4567',
    action: 'Call Now'
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: 'Live Chat',
    description: 'Chat with us in real-time',
    contact: 'Available 9 AM - 6 PM EST',
    action: 'Start Chat'
  }
];

const officeLocations = [
  {
    city: 'New York',
    address: '123 Healthcare Ave, Suite 500\nNew York, NY 10001',
    phone: '+1 (555) 123-4567',
    hours: 'Mon-Fri: 9 AM - 6 PM EST'
  },
  {
    city: 'San Francisco',
    address: '456 Medical Plaza, Floor 12\nSan Francisco, CA 94102',
    phone: '+1 (555) 987-6543',
    hours: 'Mon-Fri: 9 AM - 6 PM PST'
  },
  {
    city: 'London',
    address: '789 Medical District\nLondon, UK SW1A 1AA',
    phone: '+44 20 7123 4567',
    hours: 'Mon-Fri: 9 AM - 6 PM GMT'
  }
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast.success('Message sent successfully! We\'ll get back to you within 24 hours.');
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: '',
      category: 'general'
    });
    setLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#007fff]/5 to-[#007fff]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <EnvelopeIcon className="w-20 h-20 text-[#007fff] mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Have questions about Kendraa? Need support? We're here to help healthcare professionals connect and succeed.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white rounded-2xl border border-[#007fff]/10 p-8 shadow-lg"
          >
            <h2 className="text-2xl font-bold text-black mb-6">Send us a message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-[#007fff] mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-2 focus:ring-[#007fff]/10 bg-white transition-all duration-200"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#007fff] mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-2 focus:ring-[#007fff]/10 bg-white transition-all duration-200"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#007fff] mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-2 focus:ring-[#007fff]/10 bg-white transition-all duration-200"
                >
                  <option value="general">General Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="billing">Billing Question</option>
                  <option value="partnership">Partnership Opportunity</option>
                  <option value="feedback">Feedback</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#007fff] mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-2 focus:ring-[#007fff]/10 bg-white transition-all duration-200"
                  placeholder="Brief description of your inquiry"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#007fff] mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-2 focus:ring-[#007fff]/10 bg-white resize-none transition-all duration-200"
                  placeholder="Tell us more about your question or how we can help..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-4 bg-[#007fff] text-white rounded-xl hover:bg-[#007fff]/90 transition-all duration-200 font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <PaperAirplaneIcon className="w-5 h-5" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Contact Information */}
          <div className="space-y-8">
            
            {/* Contact Methods */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl border border-[#007fff]/10 p-8 shadow-lg"
            >
              <h2 className="text-2xl font-bold text-black mb-6">Other ways to reach us</h2>
              
              <div className="space-y-6">
                {contactMethods.map((method, index) => (
                  <motion.div
                    key={method.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-start space-x-4 p-4 rounded-xl hover:bg-[#007fff]/5 transition-colors"
                  >
                    <div className="w-12 h-12 bg-[#007fff]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <method.icon className="w-6 h-6 text-[#007fff]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-black mb-1">{method.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">{method.description}</p>
                      <p className="text-[#007fff] font-medium">{method.contact}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Office Locations */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-2xl border border-[#007fff]/10 p-8 shadow-lg"
            >
              <h2 className="text-2xl font-bold text-black mb-6">Our Offices</h2>
              
              <div className="space-y-6">
                {officeLocations.map((office, index) => (
                  <motion.div
                    key={office.city}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="border-b border-[#007fff]/10 last:border-b-0 pb-6 last:pb-0"
                  >
                    <h3 className="font-bold text-black mb-3 flex items-center">
                      <MapPinIcon className="w-5 h-5 text-[#007fff] mr-2" />
                      {office.city}
                    </h3>
                    <div className="space-y-2 text-sm text-gray-600 ml-7">
                      <p className="whitespace-pre-line">{office.address}</p>
                      <p className="flex items-center">
                        <PhoneIcon className="w-4 h-4 text-[#007fff] mr-2" />
                        {office.phone}
                      </p>
                      <p className="flex items-center">
                        <ClockIcon className="w-4 h-4 text-[#007fff] mr-2" />
                        {office.hours}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

          </div>
        </div>

        {/* Response Time Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-[#007fff]/10 rounded-2xl p-8 text-center mt-12"
        >
          <ClockIcon className="w-12 h-12 text-[#007fff] mx-auto mb-4" />
          <h3 className="text-lg font-bold text-black mb-2">Quick Response Guaranteed</h3>
          <p className="text-gray-600">
            We typically respond to all inquiries within 24 hours during business days. 
            For urgent matters, please call our support line directly.
          </p>
        </motion.div>

      </div>
    </div>
  );
}
