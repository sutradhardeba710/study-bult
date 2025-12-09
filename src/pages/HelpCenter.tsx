const HelpCenter = () => (
  <div className="max-w-4xl mx-auto py-12 px-4">
    <h1 className="text-3xl font-bold mb-6 text-gray-900">Help Center</h1>

    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Getting Started</h2>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-xl font-medium mb-3 text-gray-700">How to Create an Account</h3>
          <p className="text-gray-600 mb-4">
            Visit our registration page and sign up using your email or Google account. Make sure to complete your profile with your college, semester, and course information.
          </p>

          <h3 className="text-xl font-medium mb-3 text-gray-700">Browsing Papers</h3>
          <p className="text-gray-600 mb-4">
            Use our browse page to filter papers by college, course, semester, and subject. You can preview papers before downloading them.
          </p>

          <h3 className="text-xl font-medium mb-3 text-gray-700">Uploading Papers</h3>
          <p className="text-gray-600">
            To upload papers, navigate to the Upload page or Dashboard → Upload. Fill in the required details and upload your PDF file.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Account Management</h2>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-xl font-medium mb-3 text-gray-700">Profile Settings</h3>
          <p className="text-gray-600 mb-4">
            Update your profile information, change your password, or update your profile picture from the Dashboard → Settings page.
          </p>

          <h3 className="text-xl font-medium mb-3 text-gray-700">Managing Your Uploads</h3>
          <p className="text-gray-600">
            View and manage all your uploaded papers from the Dashboard → My Uploads page. You can edit details or delete papers you've uploaded.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Need More Help?</h2>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <p className="text-gray-600 mb-4">
            If you can't find the answer you're looking for, please check our <a href="/faq" className="text-primary-600 hover:text-primary-700 underline">FAQ page</a> or <a href="/contact" className="text-primary-600 hover:text-primary-700 underline">contact our support team</a>.
          </p>
          <a href="mailto:support@study-volte.site" className="text-primary-600 font-medium hover:text-primary-700">support@study-volte.site</a>
        </div>
      </section>
    </div>
  </div>
);

export default HelpCenter; 