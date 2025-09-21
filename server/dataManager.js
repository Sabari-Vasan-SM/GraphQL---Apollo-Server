const fs = require('fs').promises;
const path = require('path');
const { config, ERRORS } = require('./config');

class DataManager {
  constructor() {
    this.dataPath = config.database.filePath;
    this.backupPath = config.database.backupPath;
    this.ensureDirectories();
  }

  async ensureDirectories() {
    try {
      await fs.mkdir(path.dirname(this.dataPath), { recursive: true });
      await fs.mkdir(this.backupPath, { recursive: true });
    } catch (error) {
      console.error('Error creating directories:', error);
    }
  }

  async loadStudents() {
    try {
      const data = await fs.readFile(this.dataPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, return default data
        const defaultData = [
          { id: "1", name: "Vasan", age: 22, course: "Computer Science", createdAt: new Date().toISOString() },
          { id: "2", name: "Aditi", age: 21, course: "Mathematics", createdAt: new Date().toISOString() },
        ];
        await this.saveStudents(defaultData);
        return defaultData;
      }
      throw new Error(`${ERRORS.DATABASE_ERROR}: ${error.message}`);
    }
  }

  async saveStudents(students) {
    try {
      // Create backup before saving
      await this.createBackup();
      
      const data = JSON.stringify(students, null, 2);
      await fs.writeFile(this.dataPath, data, 'utf8');
      return true;
    } catch (error) {
      throw new Error(`${ERRORS.DATABASE_ERROR}: ${error.message}`);
    }
  }

  async createBackup() {
    try {
      const exists = await fs.access(this.dataPath).then(() => true).catch(() => false);
      if (exists) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFile = path.join(this.backupPath, `students-${timestamp}.json`);
        await fs.copyFile(this.dataPath, backupFile);
      }
    } catch (error) {
      console.warn('Backup creation failed:', error.message);
    }
  }

  async addStudent(student) {
    const students = await this.loadStudents();
    const newStudent = {
      ...student,
      id: this.generateId(students),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    students.push(newStudent);
    await this.saveStudents(students);
    return newStudent;
  }

  async updateStudent(id, updates) {
    const students = await this.loadStudents();
    const index = students.findIndex(s => s.id === id);
    
    if (index === -1) {
      throw new Error(ERRORS.STUDENT_NOT_FOUND);
    }

    students[index] = {
      ...students[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await this.saveStudents(students);
    return students[index];
  }

  async deleteStudent(id) {
    const students = await this.loadStudents();
    const index = students.findIndex(s => s.id === id);
    
    if (index === -1) {
      throw new Error(ERRORS.STUDENT_NOT_FOUND);
    }

    students.splice(index, 1);
    await this.saveStudents(students);
    return true;
  }

  generateId(students) {
    const maxId = students.reduce((max, student) => {
      const numId = parseInt(student.id);
      return numId > max ? numId : max;
    }, 0);
    return String(maxId + 1);
  }
}

module.exports = DataManager;