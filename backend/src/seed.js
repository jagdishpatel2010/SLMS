/**
 * Database seed script (PostgreSQL / Sequelize).
 *
 * Recreates the schema and populates it with a demo admin, a demo student,
 * sample courses, lessons, and a quiz so the app can be explored immediately.
 * Run with `npm run seed`. This is a development utility, not part of the
 * running app.
 *
 * WARNING: `sync({ force: true })` DROPS and recreates all tables.
 */
import 'dotenv/config';
import { connectDB, sequelize } from './config/db.js';
import {
  User,
  Course,
  Lesson,
  Quiz,
  Question,
  Enrollment,
} from './models/index.js';

const run = async () => {
  await connectDB();

  console.log('Recreating schema (dropping existing tables)...');
  await sequelize.sync({ force: true });

  console.log('Creating users...');
  // Passwords are hashed by the User model's beforeSave hook.
  const admin = await User.create({
    name: 'Site Admin',
    email: 'admin@slms.test',
    password: 'admin123',
    role: 'admin',
  });
  const student = await User.create({
    name: 'Demo Student',
    email: 'student@slms.test',
    password: 'student123',
    role: 'student',
  });

  console.log('Creating courses...');
  const react = await Course.create({
    name: 'Introduction to React',
    instructor: 'Jane Cooper',
    category: 'Web Development',
    duration: '6 weeks',
    level: 'Beginner',
    description:
      'Learn the fundamentals of React including components, props, state, and hooks by building small interactive apps.',
    thumbnail: 'https://picsum.photos/seed/react/400/240',
    createdBy: admin.id,
  });
  const node = await Course.create({
    name: 'Node.js & Express APIs',
    instructor: 'Robert Fox',
    category: 'Backend',
    duration: '8 weeks',
    level: 'Intermediate',
    description:
      'Design and build RESTful APIs with Node.js, Express, and PostgreSQL, covering routing, middleware, and authentication.',
    thumbnail: 'https://picsum.photos/seed/node/400/240',
    createdBy: admin.id,
  });
  await Course.create({
    name: 'PostgreSQL Essentials',
    instructor: 'Kristin Watson',
    category: 'Database',
    duration: '4 weeks',
    level: 'Beginner',
    description:
      'Understand relational databases, SQL, indexing, and joins using PostgreSQL and Sequelize.',
    thumbnail: 'https://picsum.photos/seed/postgres/400/240',
    createdBy: admin.id,
  });

  console.log('Creating lessons...');
  await Lesson.bulkCreate([
    {
      courseId: react.id,
      module: 'Getting Started',
      title: 'What is React?',
      content:
        'React is a JavaScript library for building user interfaces using a component-based architecture.',
      videoUrl: 'https://www.youtube.com/watch?v=Tn6-PIqc4UM',
      duration: '10 min',
      order: 1,
    },
    {
      courseId: react.id,
      module: 'Getting Started',
      title: 'Components and Props',
      content:
        'Components let you split the UI into independent, reusable pieces. Props pass data into components.',
      videoUrl: '',
      duration: '15 min',
      order: 2,
    },
    {
      courseId: react.id,
      module: 'State',
      title: 'Using the useState Hook',
      content: 'The useState hook adds local state to function components.',
      videoUrl: '',
      duration: '12 min',
      order: 3,
    },
    {
      courseId: node.id,
      module: 'Fundamentals',
      title: 'Setting up an Express server',
      content: 'Create a minimal Express server and define your first route.',
      videoUrl: '',
      duration: '14 min',
      order: 1,
    },
    {
      courseId: node.id,
      module: 'Fundamentals',
      title: 'Middleware explained',
      content: 'Middleware functions run during the request/response cycle.',
      videoUrl: '',
      duration: '18 min',
      order: 2,
    },
  ]);

  console.log('Creating quiz...');
  const quiz = await Quiz.create({ courseId: react.id, title: 'React Basics Quiz' });
  await Question.bulkCreate([
    {
      quizId: quiz.id,
      text: 'What does JSX stand for?',
      options: ['JavaScript XML', 'Java Syntax Extension', 'JSON Xchange', 'None of these'],
      correctOption: 0,
    },
    {
      quizId: quiz.id,
      text: 'Which hook adds state to a function component?',
      options: ['useEffect', 'useState', 'useRef', 'useMemo'],
      correctOption: 1,
    },
    {
      quizId: quiz.id,
      text: 'Props in React are…',
      options: ['Mutable', 'Read-only', 'Global variables', 'Always numbers'],
      correctOption: 1,
    },
  ]);

  console.log('Enrolling demo student in the React course...');
  await Enrollment.create({ studentId: student.id, courseId: react.id });

  console.log('\nSeed complete!');
  console.log('  Admin login   -> admin@slms.test / admin123');
  console.log('  Student login -> student@slms.test / student123');

  await sequelize.close();
  process.exit(0);
};

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
