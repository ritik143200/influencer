import React, { useState } from 'react';
import { useRouter } from '../contexts/RouterContext';

const FAQPage = ({ config }) => {
  const { navigate } = useRouter();
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: "How do I hire an influencer through InfluencerHub?",
      answer: "Hiring an influencer is simple! Search for your desired creator, browse their profile, check availability, and click the 'Hire Now' button. You'll need to provide collaboration details, dates, and requirements. Our secure payment system ensures safe transactions.",
      category: "Hiring"
    },
    {
      question: "What types of influencers are available on the platform?",
      answer: "InfluencerHub features 27+ categories including Lifestyle, Fitness, Tech, Fashion, Travel, Gaming, Food, Beauty, and many more. Each category has specialized niches to help you find exactly what you need.",
      category: "General"
    },
    {
      question: "How are influencers verified on the platform?",
      answer: "All influencers undergo a thorough verification process including identity verification, social media account audit, portfolio review, and background checks. Verified influencers display a blue checkmark badge on their profiles for your confidence.",
      category: "Verification"
    },
    {
      question: "What payment methods are accepted?",
      answer: "We accept various payment methods including credit/debit cards, net banking, UPI, digital wallets, and platform credits. All transactions are secured with industry-standard encryption.",
      category: "Payment"
    },
    {
      question: "Can I cancel or reschedule a collaboration?",
      answer: "Yes, you can cancel or reschedule collaborations based on the influencer's cancellation policy. Free cancellation is available up to 48 hours before the start date. Within 48 hours, a small fee may apply.",
      category: "Hiring"
    },
    {
      question: "How do influencers set their pricing?",
      answer: "Influencers have full control over their pricing. They can set rates per post, story, reel, or custom collaboration packages. Prices are clearly displayed on their profiles with no hidden charges.",
      category: "Pricing"
    },
    {
      question: "Is there a commission fee?",
      answer: "InfluencerHub charges a small commission fee on successful collaborations. This covers platform maintenance, customer support, security, and marketing. The exact percentage is displayed before payment confirmation.",
      category: "Pricing"
    },
    {
      question: "How do I become a verified influencer?",
      answer: "To become verified, submit your ID proof, link your social media accounts, provide campaign history, and references. Our team reviews applications within 3-5 business days. Verified influencers get priority placement and more collaboration opportunities.",
      category: "Verification"
    },
    {
      question: "What if the influencer doesn't deliver?",
      answer: "In rare cases of non-delivery, we immediately initiate a full refund and help you find a replacement creator. We also maintain a strict delivery policy that may affect the influencer's account standing.",
      category: "Support"
    },
    {
      question: "Can I communicate with influencers before hiring?",
      answer: "Yes! You can message influencers through our secure messaging system to discuss requirements, negotiate rates, and ensure they're the right fit for your brand. Communication history is saved for reference.",
      category: "Communication"
    },
    {
      question: "How does the search and recommendation system work?",
      answer: "Our smart search uses AI to match your requirements with influencer niches, demographics, reach, and engagement. You can filter by category, price range, ratings, and specific platforms to find perfect matches.",
      category: "Features"
    },
    {
      question: "What kind of support is available?",
      answer: "We offer 24/7 customer support via chat, email, and phone. Our team helps with booking issues, payment problems, artist disputes, and general inquiries. Premium members get priority support.",
      category: "Support"
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
            Find answers to common questions about InfluencerHub
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {['All', 'Hiring', 'Verification', 'Payment', 'Pricing', 'Support', 'Features', 'Communication'].map(category => (
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
