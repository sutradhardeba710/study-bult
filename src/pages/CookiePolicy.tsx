import React from 'react';

const CookiePolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Cookie Policy</h1>

      <div className="prose prose-lg max-w-none">
        <p className="mb-4">
          This Cookie Policy explains how Study Volte ("we", "us", or "our") uses cookies and similar technologies
          to recognize you when you visit our website. It explains what these technologies are and why we use them,
          as well as your rights to control our use of them.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800">What are cookies?</h2>
        <p className="mb-4">
          Cookies are small data files that are placed on your computer or mobile device when you visit a website.
          Cookies are widely used by website owners in order to make their websites work, or to work more efficiently,
          as well as to provide reporting information.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800">Why do we use cookies?</h2>
        <p className="mb-4">
          We use first-party and third-party cookies for several reasons. Some cookies are required for technical reasons
          in order for our website to operate, and we refer to these as "essential" or "strictly necessary" cookies. Other
          cookies also enable us to track and target the interests of our users to enhance the experience on our website.
          Third parties serve cookies through our website for analytics, personalization and advertising purposes.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800">Types of cookies we use</h2>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>
            <strong>Essential cookies:</strong> These cookies are strictly necessary to provide you with services available
            through our website and to use some of its features, such as access to secure areas.
          </li>
          <li>
            <strong>Analytics cookies:</strong> These cookies help us understand how visitors interact with our website,
            helping us improve our services and website functionality.
          </li>
          <li>
            <strong>Functionality cookies:</strong> These cookies allow us to remember choices you make when you use our website,
            such as remembering your login details or language preference.
          </li>
          <li>
            <strong>Targeting cookies:</strong> These cookies are used to deliver advertisements more relevant to you and your interests.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800">How can you control cookies?</h2>
        <p className="mb-4">
          You have the right to decide whether to accept or reject cookies. You can set or amend your web browser controls
          to accept or refuse cookies. If you choose to reject cookies, you may still use our website though your access to
          some functionality and areas of our website may be restricted.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800">Changes to this Cookie Policy</h2>
        <p className="mb-4">
          We may update this Cookie Policy from time to time in order to reflect, for example, changes to the cookies we use
          or for other operational, legal or regulatory reasons. Please therefore re-visit this Cookie Policy regularly to
          stay informed about our use of cookies and related technologies.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800">Contact us</h2>
        <p>
          If you have any questions about our use of cookies or other technologies, please email us at{' '}
          <a href="mailto:support@study-volte.site" className="text-primary-600 hover:text-primary-700 underline">
            support@study-volte.site
          </a>.
        </p>
      </div>
    </div>
  );
};

export default CookiePolicy; 