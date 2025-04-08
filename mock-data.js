/**
 * Mock Data Generator
 * 
 * This script adds sample categories and professions to the database.
 * Run with: node mockdata.js
 */

const mongoose = require('mongoose');
const config = require('./util/config');
const Category = require('./models/Category');
const Profession = require('./models/Profession');

// Sample categories for helpdesk tickets
const categories = [
    { name: 'Hardware', description: 'Issues related to physical computer components' },
    { name: 'Software', description: 'Problems with applications and programs' },
    { name: 'Network', description: 'Connectivity and internet-related issues' },
    { name: 'Security', description: 'Security incidents, permissions, and access' },
    { name: 'Email', description: 'Issues with email services and clients' },
    { name: 'Printer', description: 'Printer setup, connectivity, and maintenance' },
    { name: 'Account', description: 'User account management and permissions' },
    { name: 'Mobile', description: 'Smartphones, tablets, and mobile applications' },
    { name: 'Training', description: 'Requests for training on systems and tools' },
    { name: 'Other', description: 'Miscellaneous issues not falling into other categories' }
];

// Sample professions for user profiles
const professions = [
    { name: 'IT Support Specialist', description: 'Provides technical assistance and support for hardware and software issues' },
    { name: 'Network Administrator', description: 'Manages and maintains computer networks and related systems' },
    { name: 'Software Developer', description: 'Designs, develops, and maintains software applications' },
    { name: 'System Administrator', description: 'Configures, maintains, and supports server infrastructure' },
    { name: 'Database Administrator', description: 'Manages and optimizes database systems' },
    { name: 'Cybersecurity Analyst', description: 'Protects systems from security threats and vulnerabilities' },
    { name: 'Project Manager', description: 'Plans, organizes, and oversees IT projects' },
    { name: 'Business Analyst', description: 'Analyzes business processes and requirements for IT solutions' },
    { name: 'UX/UI Designer', description: 'Creates user interfaces and experiences for applications' },
    { name: 'Customer Support', description: 'Assists users with product and service inquiries' }
];

// Connect to the database
mongoose.connect(config.MongoURI)
    .then(() => {
        console.log('Connected to MongoDB');
        // Start adding data
        return addMockData();
    })
    .then(() => {
        console.log('Mock data added successfully.');
        mongoose.disconnect();
    })
    .catch(err => {
        console.error('Error:', err);
        mongoose.disconnect();
    });

async function addMockData() {
    try {
        // Clear existing data
        await Category.deleteMany({});
        await Profession.deleteMany({});
        console.log('Cleared existing categories and professions');

        // Add categories
        console.log('\nAdding categories:');
        for (const category of categories) {
            const newCategory = new Category(category);
            await newCategory.save();
            console.log(`✓ Added category: ${category.name}`);
        }

        // Add professions
        console.log('\nAdding professions:');
        for (const profession of professions) {
            const newProfession = new Profession(profession);
            await newProfession.save();
            console.log(`✓ Added profession: ${profession.name}`);
        }

        // Summary
        const categoryCount = await Category.countDocuments();
        const professionCount = await Profession.countDocuments();
        console.log(`\nSummary: Added ${categoryCount} categories and ${professionCount} professions`);

    } catch (error) {
        console.error('Error adding mock data:', error);
        throw error;
    }
}