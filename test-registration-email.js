// Test script to check if the registration email is working correctly
const testRegistrationEmail = async () => {
  try {
    console.log('Testing registration email...');
    
    // Mock user profile for testing
    const testUser = {
      uid: 'test-user-123',
      email: 'ythack600@gmail.com', // Using the configured email address
      name: 'Test User',
      college: 'Test College',
      semester: '1st',
      course: 'Computer Science',
      role: 'student',
      createdAt: new Date()
    };
    
    // Generate HTML for welcome email
    const welcomeEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to StudyVault, ${testUser.name}!</h2>
        <p>Thank you for registering with StudyVault. Your account has been successfully created.</p>
        
        <h3>Your Account Information:</h3>
        <ul>
          <li><strong>Name:</strong> ${testUser.name}</li>
          <li><strong>Email:</strong> ${testUser.email}</li>
          <li><strong>College:</strong> ${testUser.college}</li>
          <li><strong>Course:</strong> ${testUser.course}</li>
          <li><strong>Semester:</strong> ${testUser.semester}</li>
          <li><strong>Password:</strong> testpassword123 (Please change this after logging in)</li>
        </ul>
        
        <p>You can now access all the features of StudyVault, including uploading and browsing academic papers.</p>
        
        <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
        
        <p>Best regards,<br>The StudyVault Team</p>
      </div>
    `;
    
    // Test sending the registration email
    const emailResponse = await fetch('http://localhost:5000/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: testUser.email,
        subject: 'Welcome to StudyVault!',
        html: welcomeEmailHtml,
      }),
    });
    
    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      throw new Error(`Failed to send registration email: ${errorData.error || 'Unknown error'}`);
    }
    
    const result = await emailResponse.json();
    console.log('Registration email sent successfully:', result);
    
    return true;
  } catch (error) {
    console.error('Registration email test failed:', error);
    return false;
  }
};

// Run the test
testRegistrationEmail(); 