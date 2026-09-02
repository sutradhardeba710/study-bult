import React from 'react';
import SEOHead from '../components/SEOHead';

const Copyright: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <SEOHead title="Copyright & Content Removal Policy | Study Volte" description="Study Volte's copyright and DMCA content-removal policy. Learn how rights holders can request takedown of user-contributed question papers." />
      <div className="max-w-3xl mx-auto bg-white border border-gray-200 shadow-sm p-8 sm:p-12 text-gray-800 text-sm leading-relaxed font-serif text-justify">

        <div className="text-center mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-wide mb-2">Copyright &amp; Content Removal Policy</h1>
          <p className="text-xs text-gray-500 uppercase tracking-wider">Last Updated: September 1, 2026</p>
        </div>

        <div className="space-y-6">
          <p>
            Study Volte ("We", "Us", "Our") respects the intellectual property rights of others and expects Our users to do the same. This policy explains the nature of the material hosted on the Service and the process by which any rights holder may request the removal of content.
          </p>

          <section>
            <h2 className="text-lg font-bold uppercase tracking-wide mt-8 mb-3 border-b border-gray-300 pb-1">1. Nature of the Content</h2>
            <p className="mb-3">
              1.1. Study Volte is a community-driven platform. The question papers, notes, and study materials available on the Service are <strong>uploaded and contributed by individual students and users</strong>. We do not create, author, or claim ownership of these user-submitted materials.
            </p>
            <p className="mb-3">
              1.2. We act solely as a neutral hosting intermediary that enables students to share academic resources. We do not systematically pre-screen every uploaded document for copyright ownership, but We respond promptly to valid removal requests as described below.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold uppercase tracking-wide mt-8 mb-3 border-b border-gray-300 pb-1">2. Respect for Intellectual Property</h2>
            <p className="mb-3">
              2.1. Users agree not to upload any material that infringes the copyright, trademark, or other intellectual property rights of any third party. Users represent that they hold the necessary rights to any content they contribute, or that the content is freely shareable for educational purposes.
            </p>
            <p className="mb-3">
              2.2. If You are the copyright owner of any examination paper, document, or material and believe that content hosted on the Service infringes Your rights, We will remove or disable access to that material upon receipt of a valid notice.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold uppercase tracking-wide mt-8 mb-3 border-b border-gray-300 pb-1">3. Filing a Removal (Takedown) Request</h2>
            <p className="mb-2">
              3.1. To request the removal of allegedly infringing content, please send a written notice to <strong>support@study-volte.site</strong> containing the following information:
            </p>
            <ul className="list-[lower-alpha] pl-6 space-y-2 mb-4">
              <li>Your full name, physical address, telephone number, and email address.</li>
              <li>A clear description of the copyrighted work or material You claim has been infringed.</li>
              <li>The exact URL(s) or location(s) on the Service where the allegedly infringing material appears.</li>
              <li>A statement that You have a good-faith belief that the disputed use is not authorized by the copyright owner, its agent, or the law.</li>
              <li>A statement, made under penalty of perjury, that the information in Your notice is accurate and that You are the copyright owner or authorized to act on the owner's behalf.</li>
              <li>Your physical or electronic signature.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold uppercase tracking-wide mt-8 mb-3 border-b border-gray-300 pb-1">4. Our Response</h2>
            <p className="mb-3">
              4.1. Upon receiving a complete and valid removal request, We will make reasonable efforts to review and, where appropriate, remove or disable access to the identified material within a reasonable timeframe, typically within <strong>72 hours</strong>.
            </p>
            <p className="mb-3">
              4.2. We reserve the right to remove any content, at Our sole discretion, that We believe may infringe intellectual property rights or otherwise violate Our Terms of Service, with or without a formal request.
            </p>
            <p className="mb-3">
              4.3. We may terminate the accounts of users who are found to be repeat infringers.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold uppercase tracking-wide mt-8 mb-3 border-b border-gray-300 pb-1">5. Counter-Notice</h2>
            <p className="mb-3">
              5.1. If You believe that material You uploaded was removed in error, You may submit a counter-notice to <strong>support@study-volte.site</strong> explaining why You believe the content should be restored. We will evaluate counter-notices in good faith.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold uppercase tracking-wide mt-8 mb-3 border-b border-gray-300 pb-1">6. Contact Us</h2>
            <p>
              6.1. All copyright and content-removal correspondence should be directed to: <strong>support@study-volte.site</strong>.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};

export default Copyright;
