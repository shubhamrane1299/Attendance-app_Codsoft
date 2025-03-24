React Native Code (Front-end)
App.js

jsx
import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput } from 'react-native';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

const App = () => {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [attendance, setAttendance] = useState({});

  useEffect(() => {
    firebase.auth().onAuthStateChanged((user) => {
      setUser(user);
    });
  }, []);

  const handleLogin = async () => {
    try {
      const userCredential = await firebase.auth().signInWithEmailAndPassword('user@example.com', 'password');
      setUser(userCredential.user);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = async () => {
    try {
      await firebase.auth().signOut();
      setUser(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleGetCourses = async () => {
    try {
      const coursesRef = firebase.database().ref('courses');
      const coursesSnapshot = await coursesRef.once('value');
      const coursesData = coursesSnapshot.val();
      setCourses(coursesData);
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarkAttendance = async (courseId) => {
    try {
      const attendanceRef = firebase.database().ref(`attendance/${courseId}`);
      const attendanceSnapshot = await attendanceRef.once('value');
      const attendanceData = attendanceSnapshot.val();
      if (!attendanceData) {
        await attendanceRef.set({ present: true });
      } else {
        await attendanceRef.update({ present: !attendanceData.present });
      }
      setAttendance((prevAttendance) => ({ ...prevAttendance, [courseId]: !attendanceData.present }));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View>
      {user ? (
        <View>
          <Text>Welcome, {user.email}!</Text>
          <Button title="Logout" onPress={handleLogout} />
          <Button title="Get Courses" onPress={handleGetCourses} />
          {courses.map((course) => (
            <View key={course.id}>
              <Text>{course.name}</Text>
              <Button title={`Mark ${attendance[course.id] ? 'Absent' : 'Present'}`} onPress={() => handleMarkAttendance(course.id)} />
            </View>
          ))}
        </View>
      ) : (
        <View>
          <TextInput placeholder="Email" />
          <TextInput placeholder="Password" secureTextEntry />
          <Button title="Login" onPress={handleLogin} />
        </View>
      )}
    </View>
  );
};

export default App;


Node.js Code (Back-end)
server.js

const express = require('express');
const app = express();
const firebase = require('firebase-admin');

firebase.initializeApp({
  credential: firebase.credential.cert('path/to/serviceAccountKey.json'),
  databaseURL: 'https://your-database-url.firebaseio.com',
});

const db = firebase.database();

app.get('/courses', (req, res) => {
  db.ref('courses').once('value', (snapshot) => {
    const courses = snapshot.val();
    res.json(courses);
  });
});

app.post('/attendance', (req, res) => {
  const { courseId, present } = req.body;
  db.ref(`attendance/${courseId}`).set({ present });
  res.json({ message: 'Attendance marked successfully' });
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});


Firebase Realtime Database Structure

{
  "courses": {
    "course1": {
      "name": "Course 1",
      "description": "This is course 1"
    },
    "course2": {
      "name": "Course 2",
      "description": "This is course 2"
    }
  },
  "attendance": {
    "course1": {
      "present": true
    },
    "course2": {
      "present": false
    }
  }
}