// Test script to check if the email API is working correctly
const testEmailAPI = async () => {
  try {
    console.log('Testing email API...');
    
    // Test connection
    const connectionResponse = await fetch('http://localhost:5000');
    if (!connectionResponse.ok) {
      throw new Error('Email server is not running or not accessible');
    }
    console.log('Email server connection: OK');
    
    // Test sending an email
    const emailResponse = await fetch('http://localhost:5000/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: 'ythack600@gmail.com', // Using the configured email address
        subject: 'Test Email from StudyVault',
        html: '<h1>Test Email</h1><p>This is a test email from StudyVault.</p>',
      }),
    });
    
    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      throw new Error(`Failed to send test email: ${errorData.error || 'Unknown error'}`);
    }
    
    const result = await emailResponse.json();
    console.log('Email sent successfully:', result);
    
    return true;
  } catch (error) {
    console.error('Email test failed:', error);
    return false;
  }
};

// Run the test
testEmailAPI(); 