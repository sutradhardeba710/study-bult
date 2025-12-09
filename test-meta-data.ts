// Test script to check if meta data is being loaded correctly
// Mock import.meta.env for Node.js environment
if (typeof import.meta.env === 'undefined') {
  // @ts-ignore
  global.import = { meta: { env: process.env } };
}
import { getMetaItems } from './src/services/meta.ts';

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