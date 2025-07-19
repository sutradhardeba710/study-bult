import React, { useState } from 'react';

interface FAQItemProps {
  question: string;
  answer: React.ReactNode;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border-b border-gray-200 py-5">
      <button
        className="flex justify-between items-center w-full text-left font-medium text-gray-800 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="text-lg">{question}</span>
        <svg
          className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div 
        className={`mt-3 text-gray-600 overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
        aria-hidden={!isOpen}
      >
        {answer}
      </div>
    </div>
  );
};

const FAQ = () => {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-900">Frequently Asked Questions</h1>
      
      <div className="space-y-2">
        <FAQItem 
          question="What is StudyVault?" 
          answer={
            <p>StudyVault is a platform where students can share and access question papers and academic resources from various colleges and courses. Our goal is to help students prepare better for exams by providing access to previous years' question papers.</p>
          } 
        />
        
        <FAQItem 
          question="How do I create an account?" 
          answer={
            <p>You can create an account by clicking on the "Register" button in the navigation bar. You can sign up using your email address or with your Google account. Make sure to complete your profile with your college, semester, and course information.</p>
          } 
        />
        
        <FAQItem 
          question="Is StudyVault free to use?" 
          answer={
            <p>Yes, StudyVault is completely free for students. We believe in making academic resources accessible to everyone.</p>
          } 
        />
        
        <FAQItem 
          question="How do I upload papers?" 
          answer={
            <>
              <p>To upload papers:</p>
              <ol className="list-decimal ml-5 mt-2 space-y-1">
                <li>Log in to your account</li>
                <li>Navigate to the Upload page or Dashboard → Upload</li>
                <li>Fill in the required details about the paper (college, course, subject, etc.)</li>
                <li>Upload your PDF file</li>
                <li>Submit the form</li>
              </ol>
            </>
          } 
        />
        
        <FAQItem 
          question="What file types are supported?" 
          answer={
            <p>Currently, we only support PDF files for question papers to ensure consistency and compatibility across all devices.</p>
          } 
        />
        
        <FAQItem 
          question="Can I edit or delete papers I've uploaded?" 
          answer={
            <p>Yes, you can manage all your uploaded papers from the Dashboard → My Uploads page. From there, you can edit the details or delete papers you've uploaded.</p>
          } 
        />
        
        <FAQItem 
          question="How do I report inappropriate content?" 
          answer={
            <p>If you find any inappropriate content or papers that violate our terms of service, please contact us at <a href="mailto:support@studyvault.com" className="text-primary-600 hover:text-primary-700 underline">support@studyvault.com</a> with details of the content.</p>
          } 
        />
        
        <FAQItem 
          question="How do I reset my password?" 
          answer={
            <p>You can reset your password by clicking on the "Forgot Password" link on the login page. You'll receive an email with instructions to reset your password.</p>
          } 
        />
        
        <FAQItem 
          question="Can I change my profile information?" 
          answer={
            <p>Yes, you can update your profile information, including your name, college, semester, and profile picture from the Dashboard → Settings page.</p>
          } 
        />
        
        <FAQItem 
          question="How do I contact support?" 
          answer={
            <p>You can contact our support team at <a href="mailto:support@studyvault.com" className="text-primary-600 hover:text-primary-700 underline">support@studyvault.com</a> or visit our <a href="/contact" className="text-primary-600 hover:text-primary-700 underline">Contact page</a>.</p>
          } 
        />
      </div>
    </div>
  );
};

export default FAQ; 