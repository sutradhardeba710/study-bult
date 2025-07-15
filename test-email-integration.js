// Test script to simulate the registration process and email sending
const testEmailIntegration = async () => {
  try {
    console.log('Testing email integration with registration process...');
    
    // Mock user data
    const user = {
      email: 'ythack600@gmail.com',
      name: 'Test User',
      college: 'Test College',
      course: 'Computer Science',
      semester: '1st',
      role: 'student',
      uid: 'test-uid-' + Date.now(),
      createdAt: new Date()
    };
    
    // Step 1: Test the email API connection
    console.log('Step 1: Testing API connection...');
    const connectionResponse = await fetch('http://localhost:5000');
    if (!connectionResponse.ok) {
      throw new Error('Email server is not running or not accessible');
    }
    console.log('✓ API connection successful');
    
    // Step 2: Simulate the sendWelcomeEmail function
    console.log('Step 2: Simulating welcome email...');
    
    const welcomeEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to StudyVault, ${user.name}!</h2>
        <p>Thank you for registering with StudyVault. Your account has been successfully created.</p>
        
        <h3>Your Account Information:</h3>
        <ul>
          <li><strong>Name:</strong> ${user.name}</li>
          <li><strong>Email:</strong> ${user.email}</li>
          <li><strong>College:</strong> ${user.college}</li>
          <li><strong>Course:</strong> ${user.course}</li>
          <li><strong>Semester:</strong> ${user.semester}</li>
          <li><strong>Password:</strong> testpassword123 (Please change this after logging in)</li>
        </ul>
        
        <p>You can now access all the features of StudyVault, including uploading and browsing academic papers.</p>
        
        <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
        
        <p>Best regards,<br>The StudyVault Team</p>
      </div>
    `;
    
    const emailResponse = await fetch('http://localhost:5000/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: user.email,
        subject: 'Welcome to StudyVault!',
        html: welcomeEmailHtml,
      }),
    });
    
    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      throw new Error(`Failed to send welcome email: ${errorData.error || 'Unknown error'}`);
    }
    
    const result = await emailResponse.json();
    console.log('✓ Welcome email sent successfully:', result);
    
    console.log('\nTest completed successfully! Check your email inbox.');
    return true;
  } catch (error) {
    console.error('Test failed:', error);
    return false;
  }
};

// Run the test
testEmailIntegration(); 