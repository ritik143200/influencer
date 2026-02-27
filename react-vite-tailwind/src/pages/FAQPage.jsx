import React, { useState } from 'react';
import { useRouter } from '../contexts/RouterContext';

const FAQPage = ({ config }) => {
  const { navigate } = useRouter();
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: "How do I book an artist through ArtistHub?",
      answer: "Booking an artist is simple! Search for your desired artist, browse their profile, check availability, and click the 'Book Now' button. You'll need to provide event details, dates, and requirements. Our secure payment system ensures safe transactions.",
      category: "Booking"
    },
    {
      question: "What types of artists are available on the platform?",
      answer: "ArtistHub features 27+ categories including Singers, Bands, Dancers, Instrumentalists, DJs, Actors, Magicians, Makeup Artists, Painters, and many more. Each category has specialized subcategories to help you find exactly what you need.",
      category: "General"
    },
    {
      question: "How are artists verified on the platform?",
      answer: "All artists undergo a thorough verification process including identity verification, portfolio review, skill assessment, and background checks. Verified artists display a blue checkmark badge on their profiles for your confidence.",
      category: "Verification"
    },
    {
      question: "What payment methods are accepted?",
      answer: "We accept various payment methods including credit/debit cards, net banking, UPI, digital wallets, and platform credits. All transactions are secured with industry-standard encryption.",
      category: "Payment"
    },
    {
      question: "Can I cancel or reschedule a booking?",
      answer: "Yes, you can cancel or reschedule bookings based on the artist's cancellation policy. Free cancellation is available up to 48 hours before the event. Within 48 hours, a small fee may apply.",
      category: "Booking"
    },
    {
      question: "How do artists set their pricing?",
      answer: "Artists have full control over their pricing. They can set hourly rates, event-based pricing, or custom packages. Prices are clearly displayed on their profiles with no hidden charges.",
      category: "Pricing"
    },
    {
      question: "Is there a commission fee?",
      answer: "ArtistHub charges a small commission fee on successful bookings. This covers platform maintenance, customer support, security, and marketing. The exact percentage is displayed before payment confirmation.",
      category: "Pricing"
    },
    {
      question: "How do I become a verified artist?",
      answer: "To become verified, submit your ID proof, portfolio samples, skill demonstration videos, and references. Our team reviews applications within 3-5 business days. Verified artists get priority placement and more booking opportunities.",
      category: "Verification"
    },
    {
      question: "What if the artist doesn't show up?",
      answer: "In rare cases of no-show, we immediately initiate a full refund and help you find a replacement artist. We also maintain a no-show policy that may affect the artist's account standing.",
      category: "Support"
    },
    {
      question: "Can I communicate with artists before booking?",
      answer: "Yes! You can message artists through our secure messaging system to discuss requirements, negotiate details, and ensure they're the right fit for your event. Communication history is saved for reference.",
      category: "Communication"
    },
    {
      question: "How does the search and recommendation system work?",
      answer: "Our smart search uses AI to match your requirements with artist skills, experience, location, and availability. You can filter by category, price range, ratings, and specific skills to find perfect matches.",
      category: "Features"
    },
    {
      question: "What kind of support is available?",
      answer: "We offer 24/7 customer support via chat, email, and phone. Our team helps with booking issues, payment problems, artist disputes, and general inquiries. Premium members get priority support.",
      category: "Support"
    },
    {
      question: "Can artists leave reviews for clients?",
      answer: "Yes, after completing a booking, both artists and clients can leave reviews. This builds trust and helps the community make informed decisions. Reviews are moderated to ensure fairness.",
      category: "Reviews"
    }
  ];

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="pt-24 pb-16 min-h-full" style={{ backgroundColor: config.background_color }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4" style={{ color: config.text_color }}>
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about ArtistHub
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {['All', 'Booking', 'Verification', 'Payment', 'Pricing', 'Support', 'Features', 'Communication', 'Reviews'].map(category => (
              <button
                key={category}
                className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-brand-100 hover:text-brand-600 transition-colors"
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4 mb-12">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 rounded-t-2xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs px-2 py-1 bg-brand-100 text-brand-700 rounded-full font-medium">
                    {faq.category}
                  </span>
                  <span className="font-medium text-gray-900">
                    {faq.question}
                  </span>
                </div>
                <svg 
                  className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${
                    activeIndex === index ? 'rotate-180' : ''
                  }`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {activeIndex === index && (
                <div className="px-6 pb-4 border-t border-gray-100">
                  <p className="text-gray-700 leading-relaxed pt-4">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Help Section */}
        <div className="text-center">
          <div className="bg-gray-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-4" style={{ color: config.text_color }}>
              Still have questions?
            </h2>
            <p className="text-gray-600 mb-6">
              Our support team is here to help you with any questions or concerns.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('contact')}
                className="px-6 py-3 bg-brand-500 text-white font-semibold rounded-xl hover:bg-brand-600 transition-colors"
              >
                Contact Support
              </button>
              <button 
                onClick={() => navigate('about')}
                className="px-6 py-3 bg-white text-brand-600 font-semibold rounded-xl border-2 border-brand-500 hover:bg-brand-50 transition-colors"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
