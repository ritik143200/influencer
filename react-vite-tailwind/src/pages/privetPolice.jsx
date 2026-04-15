import React from 'react';
import { useRouter } from '../contexts/RouterContext';
import { ArrowLeft, Shield, Eye, Lock, Database, Users, AlertCircle } from 'lucide-react';

const PrivacyPolicy = ({ config }) => {
  const { navigate } = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-brand-500 via-brand-400 to-amber-400 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    
          <div className="text-center">
            <Shield className="w-16 h-16 mx-auto mb-6 text-white/90" />
            <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Your privacy is important to us. Learn how we collect, use, and protect your information.
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
          
          {/* Data Collection */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <Database className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">Data Collection</h2>
            </div>
            <div className="bg-green-50 rounded-lg p-6">
              <p className="text-gray-600 leading-relaxed text-lg">
                We collect information you provide directly to us, such as when you create an account, 
                update your profile, or use our services. This includes your name, email address, 
                contact information, and other details you choose to provide.
              </p>
            </div>
          </div>

          {/* Data Usage */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <Eye className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">How We Use Your Information</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900 mb-3 text-lg">Service Improvement</h3>
                <p className="text-gray-600">To provide, maintain, and improve our services and platform functionality.</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900 mb-3 text-lg">Communication</h3>
                <p className="text-gray-600">To respond to your inquiries, provide support, and send important updates.</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900 mb-3 text-lg">Platform Security</h3>
                <p className="text-gray-600">To monitor usage patterns and improve platform security and performance.</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900 mb-3 text-lg">Personalization</h3>
                <p className="text-gray-600">To personalize your experience and show relevant content and features.</p>
              </div>
            </div>
          </div>

          {/* Data Protection */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">Data Protection</h2>
            </div>
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-4 text-lg">Our Commitment:</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">We use industry-standard security measures to protect your data</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">Access to your data is strictly controlled and logged</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">Regular security audits and updates</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">Secure data encryption and storage</p>
                </div>
              </div>
            </div>
          </div>

          {/* Third-Party Sharing */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">Third-Party Sharing</h2>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <p className="text-gray-700 leading-relaxed font-medium mb-4">
                <strong>We do not sell, trade, or otherwise transfer your personal information to third parties</strong> 
                without your consent, except when required by law or as necessary to protect our rights, 
                property, or safety.
              </p>
              <div className="mt-4 p-4 bg-white rounded-lg border border-red-100">
                <h4 className="font-semibold text-red-800 mb-2">Exceptions:</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>When you explicitly authorize us to share information</li>
                  <li>When required by applicable law or legal process</li>
                  <li>To protect our rights, property, or safety</li>
                  <li>With trusted service providers who assist in operating our platform</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Your Rights */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">Your Rights</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900 mb-3 text-lg">Access & Update</h3>
                <p className="text-gray-600">You can access, update, or delete your personal information at any time.</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900 mb-3 text-lg">Data Portability</h3>
                <p className="text-gray-600">Request a copy of your data in a machine-readable format.</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900 mb-3 text-lg">Opt-Out Rights</h3>
                <p className="text-gray-600">Opt out of marketing communications and certain data uses.</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900 mb-3 text-lg">Complaint Rights</h3>
                <p className="text-gray-600">File complaints about our data practices with relevant authorities.</p>
              </div>
            </div>
          </div>

          {/* Contact for Privacy */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <AlertCircle className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">Privacy Questions</h2>
            </div>
            <div className="bg-green-50 rounded-lg p-6 border border-green-200">
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about this Privacy Policy or our data practices, 
                please contact us through our contact page. We will respond to your concerns 
                promptly and address any issues you may have.
              </p>
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

export default PrivacyPolicy;
