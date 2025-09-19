import Link from 'next/link';
import Logo from '@/components/common/Logo';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-3">
            <Logo size="sm" className="h-8" />
            <span className="text-xl font-bold text-gray-900">Kendraa</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms and Conditions of Use</h1>
          
          <div className="text-sm text-gray-600 mb-8">
            <p><strong>Last Updated:</strong> January 2025</p>
            <p><strong>Effective Date:</strong> January 2025</p>
          </div>

          <div className="space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                Welcome to Kendraa (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). These Terms and Conditions of Use (&quot;Terms&quot;) govern your use of our healthcare professional networking platform, including our website, mobile applications, and related services (collectively, the &quot;Service&quot;).
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of these Terms, you may not access the Service.
              </p>
            </section>

            {/* Acceptance of Terms */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                By creating an account, accessing, or using Kendraa, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. These Terms constitute a legally binding agreement between you and Kendraa.
              </p>
            </section>

            {/* Eligibility */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Eligibility</h2>
              <p className="text-gray-700 leading-relaxed">
                To use our Service, you must:
              </p>
              <ul className="list-disc list-inside text-gray-700 leading-relaxed mt-2 space-y-1">
                <li>Be at least 18 years of age or the age of majority in your jurisdiction</li>
                <li>Be a healthcare professional, healthcare institution, or medical researcher</li>
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Comply with all applicable laws and regulations</li>
              </ul>
            </section>

            {/* User Accounts */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. User Accounts</h2>
              <p className="text-gray-700 leading-relaxed">
                When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for:
              </p>
              <ul className="list-disc list-inside text-gray-700 leading-relaxed mt-2 space-y-1">
                <li>Safeguarding your account password and all activities under your account</li>
                <li>Notifying us immediately of any unauthorized use of your account</li>
                <li>Ensuring your account information remains accurate and up-to-date</li>
                <li>Maintaining the confidentiality of your account credentials</li>
              </ul>
            </section>

            {/* Acceptable Use */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Acceptable Use Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                You agree to use our Service only for lawful purposes and in accordance with these Terms. You agree NOT to:
              </p>
              <ul className="list-disc list-inside text-gray-700 leading-relaxed mt-2 space-y-1">
                <li>Violate any applicable federal, state, local, or international law or regulation</li>
                <li>Transmit or procure the sending of any advertising or promotional material without our prior written consent</li>
                <li>Impersonate or attempt to impersonate another person or entity</li>
                <li>Engage in any conduct that restricts or inhibits anyone&apos;s use or enjoyment of the Service</li>
                <li>Use the Service in any manner that could disable, overburden, damage, or impair the Service</li>
                <li>Use any robot, spider, or other automatic device to access the Service for any purpose</li>
                <li>Share false, misleading, or fraudulent information</li>
                <li>Violate patient privacy or confidentiality requirements</li>
                <li>Use the Service for commercial purposes without authorization</li>
              </ul>
            </section>

            {/* Healthcare Professional Responsibilities */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Healthcare Professional Responsibilities</h2>
              <p className="text-gray-700 leading-relaxed">
                As a healthcare professional using our Service, you acknowledge and agree that:
              </p>
              <ul className="list-disc list-inside text-gray-700 leading-relaxed mt-2 space-y-1">
                <li>You are responsible for maintaining your professional licenses and certifications</li>
                <li>You will not provide medical advice through our platform unless specifically authorized</li>
                <li>You will comply with all applicable medical ethics and professional standards</li>
                <li>You will not share patient information or violate HIPAA or other privacy regulations</li>
                <li>You will verify the credentials of other professionals before engaging in professional relationships</li>
                <li>You understand that Kendraa does not verify the credentials of all users</li>
              </ul>
            </section>

            {/* Content and Intellectual Property */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Content and Intellectual Property</h2>
              <h3 className="text-xl font-medium text-gray-900 mb-3">7.1 Your Content</h3>
              <p className="text-gray-700 leading-relaxed">
                You retain ownership of content you post, upload, or share on our Service (&quot;Your Content&quot;). By posting Your Content, you grant us a non-exclusive, royalty-free, worldwide license to use, display, and distribute Your Content in connection with the Service.
              </p>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3 mt-6">7.2 Our Content</h3>
              <p className="text-gray-700 leading-relaxed">
                The Service and its original content, features, and functionality are owned by Kendraa and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
            </section>

            {/* Privacy and Data Protection */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Privacy and Data Protection</h2>
              <p className="text-gray-700 leading-relaxed">
                Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information when you use our Service. By using our Service, you agree to the collection and use of information in accordance with our Privacy Policy.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                We implement appropriate technical and organizational measures to protect your personal information, but we cannot guarantee absolute security.
              </p>
            </section>

            {/* Disclaimers */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Disclaimers</h2>
              <p className="text-gray-700 leading-relaxed">
                THE SERVICE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS. KENDRAA EXPRESSLY DISCLAIMS ALL WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                Kendraa does not warrant that the Service will be uninterrupted, secure, or error-free, or that any defects will be corrected.
              </p>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, KENDRAA SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR USE OF THE SERVICE.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                In no event shall Kendraa&apos;s total liability to you for all damages exceed the amount you paid us in the twelve (12) months preceding the claim.
              </p>
            </section>

            {/* Indemnification */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Indemnification</h2>
              <p className="text-gray-700 leading-relaxed">
                You agree to defend, indemnify, and hold harmless Kendraa and its officers, directors, employees, and agents from and against any claims, damages, obligations, losses, liabilities, costs, or debt, and expenses (including attorney&apos;s fees) arising from:
              </p>
              <ul className="list-disc list-inside text-gray-700 leading-relaxed mt-2 space-y-1">
                <li>Your use of the Service</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any third-party right, including privacy or intellectual property rights</li>
                <li>Any content you post or share on the Service</li>
              </ul>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Termination</h2>
              <p className="text-gray-700 leading-relaxed">
                We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                Upon termination, your right to use the Service will cease immediately. All provisions of the Terms which by their nature should survive termination shall survive termination.
              </p>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Governing Law</h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms shall be interpreted and governed by the laws of the United States, without regard to its conflict of law provisions. Any disputes arising from these Terms or your use of the Service shall be subject to the exclusive jurisdiction of the courts in the United States.
              </p>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                Your continued use of the Service after any such changes constitutes your acceptance of the new Terms.
              </p>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">15. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about these Terms, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">
                  <strong>Kendraa</strong><br />
                  Email: legal@kendraa.com<br />
                  Website: <Link href="/contact" className="text-[#007fff] hover:underline">Contact Us</Link>
                </p>
              </div>
            </section>

            {/* Severability */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">16. Severability</h2>
              <p className="text-gray-700 leading-relaxed">
                If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect.
              </p>
            </section>

            {/* Entire Agreement */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">17. Entire Agreement</h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms, together with our Privacy Policy, constitute the sole and entire agreement between you and Kendraa regarding the Service and supersede all prior and contemporaneous understandings, agreements, representations, and warranties.
              </p>
            </section>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <p className="text-sm text-gray-500">
                &copy; 2025 Kendraa. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 sm:mt-0">
                <Link href="/privacy" className="text-sm text-[#007fff] hover:underline">
                  Privacy Policy
                </Link>
                <Link href="/contact" className="text-sm text-[#007fff] hover:underline">
                  Contact Us
                </Link>
                <Link href="/" className="text-sm text-[#007fff] hover:underline">
                  Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
