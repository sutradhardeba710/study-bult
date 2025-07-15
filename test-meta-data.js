// Test script to check if meta data is being loaded correctly
import { getMetaItems } from './src/services/meta';

const testMetaData = async () => {
  try {
    console.log('Testing meta data loading...');
    
    // Get meta data
    const colleges = await getMetaItems('colleges');
    const semesters = await getMetaItems('semesters');
    const courses = await getMetaItems('courses');
    
    console.log('Colleges:', colleges);
    console.log('Semesters:', semesters);
    console.log('Courses:', courses);
    
    return { colleges, semesters, courses };
  } catch (error) {
    console.error('Error loading meta data:', error);
    return null;
  }
};

// Run the test
testMetaData(); 