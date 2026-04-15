import React from 'react';
import { useRouter } from '../contexts/RouterContext';
import { ArrowLeft, FileText, Shield, Users, AlertCircle, Mail, Phone, MapPin } from 'lucide-react';

const TermsAndCondition = ({ config }) => {
  const { navigate } = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-brand-500 via-brand-250 to-amber-500 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center">
            <FileText className="w-16 h-16 mx-auto mb-6 text-white/90" />
            <h1 className="text-4xl font-bold mb-4">Terms & Conditions</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Please read our terms and conditions carefully before using our platform
            </p>
          </div>
        </div>
      </div>

      {/* Content Section - Full Width */}
      <div className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
          
          {/* Main Terms Content */}
          <div className="prose prose-gray max-w-none">
            <div className="space-y-6">
              
              {/* Welcome Section */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
                <p className="text-gray-700 leading-relaxed text-lg font-medium">
                  Welcome to our platform. By accessing or using this application, you agree to comply with and be bound by the following terms and conditions.
                </p>
              </div>

              {/* User Registration Section */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3 text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  User Registration & Account Security
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Users must provide accurate and complete information during registration and are responsible for maintaining the confidentiality of their account credentials.
                </p>
              </div>

              {/* User Usage Section */}
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3 text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  Platform Usage Guidelines
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Users can send inquiries and contact influencers for collaboration purposes. Any misuse, spam, or illegal activity is strictly prohibited.
                </p>
              </div>

              {/* Influencer Responsibilities */}
              <div className="bg-purple-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3 text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-600" />
                  Influencer Responsibilities
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Influencers must maintain accurate profile information and respond to inquiries honestly. Providing false or misleading information may result in account suspension.
                </p>
              </div>

              {/* Admin Authority */}
              <div className="bg-red-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3 text-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  Admin Authority
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  The admin has full authority to manage users, influencers, inquiries, and platform data, and may suspend or remove accounts that violate these terms.
                </p>
              </div>

              {/* Platform Limitations */}
              <div className="bg-yellow-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3 text-lg flex items-center gap-2">
                  <Mail className="w-5 h-5 text-yellow-600" />
                  Platform Limitations
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  All inquiries are managed through the platform, but the platform is not responsible for any agreements or transactions made between users and influencers outside the system.
                </p>
              </div>

              {/* Data Privacy */}
              <div className="bg-indigo-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3 text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-indigo-600" />
                  Data Privacy & Protection
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  We collect and store user data to improve our services. User data will not be shared with third parties without consent, except when required by law.
                </p>
              </div>

              {/* Account Suspension */}
              <div className="bg-orange-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3 text-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  Account Suspension Rights
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  We reserve the right to suspend or terminate any account that violates these terms without prior notice.
                </p>
              </div>

              {/* Liability Disclaimer */}
              <div className="bg-gray-100 rounded-lg p-6 border border-gray-300">
                <h3 className="font-semibold text-gray-900 mb-3 text-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-gray-600" />
                  Liability Disclaimer
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  The platform is not liable for any direct or indirect damages resulting from interactions between users and influencers.
                </p>
              </div>

              {/* Terms Updates */}
              <div className="bg-teal-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3 text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-teal-600" />
                  Terms Updates
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  We may update these terms at any time, and continued use of the platform means you accept the updated terms.
                </p>
              </div>

              {/* Contact Information */}
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <h3 className="font-semibold text-gray-900 mb-3 text-lg flex items-center gap-2">
                  <Mail className="w-5 h-5 text-blue-600" />
                  Contact & Support
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  For any queries, users can contact us through the contact page.
                </p>
              </div>

            </div>
          </div>

          {/* Last Updated */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-gray-500 text-sm">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndCondition;