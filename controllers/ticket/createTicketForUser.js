const Ticket = require('../../models/Ticket');
const User = require('../../models/User');
const Category = require('../../models/Category');
const Organization = require('../../models/Organization');
const { trackTicketHistory } = require('../../middleware/ticketHistory');

module.exports = async (req, res) => {
    const { userId, summary, description, category, priority = 'medium' } = req.body;
    const adminId = req.user._id;

    // Ensure admin role
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Only admins can create tickets for other users' });
    }

    if (!userId || !description || !category) {
        return res.status(400).json({ message: 'User ID, description, and category are required' });
    }

    try {
        // Check if target user exists
        const targetUser = await User.findById(userId);
        if (!targetUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if user belongs to an organization
        const userOrg = await Organization.findOne({ users: userId });
        if (!userOrg) {
            return res.status(403).json({ message: 'Target user must belong to an organization' });
        }

        // Check if admin is also in the same organization
        const adminInOrg = userOrg.users.some(id => id.toString() === adminId.toString());
        if (!adminInOrg) {
            return res.status(403).json({ message: 'Admin must be in the same organization as the user' });
        }

        // Validate category exists
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Validate priority is valid
        const validPriorities = ['low', 'medium', 'high'];
        if (!validPriorities.includes(priority)) {
            return res.status(400).json({ message: 'Invalid priority' });
        }

        // Create the ticket for the user
        const newTicket = new Ticket({
            user: userId,             // The user ID for whom the ticket is created
            organization: userOrg._id,
            summary: summary || 'No summary provided',
            description,
            priority,
            category,
            status: 'open'
        });

        await newTicket.save();

        // Track ticket creation in history
        await trackTicketHistory(
            newTicket._id,
            adminId,                  // Record that the admin created this ticket
            'created_by_admin',
            null,
            {
                summary: newTicket.summary,
                description: newTicket.description,
                priority: newTicket.priority,
                status: newTicket.status,
                createdForUser: userId
            }
        );

        // Add ticket to organization
        userOrg.tickets.push(newTicket._id);
        await userOrg.save();

        return res.status(201).json({
            message: 'Ticket created successfully for user',
            ticket: newTicket
        });
    } catch (error) {
        console.error("Error creating ticket for user.\n\n", error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};