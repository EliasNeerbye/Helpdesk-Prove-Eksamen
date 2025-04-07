const Ticket = require('../../models/Ticket');
const Category = require('../../models/Category');
const Organization = require('../../models/Organization');
const { trackTicketHistory } = require('../../middleware/ticketHistory');

module.exports = async (req, res) => {
    const { summary, description, category, priority = 'medium' } = req.body;
    const userId = req.user._id;

    if (!description || !category) {
        return res.status(400).json({ message: 'Description and category are required' });
    }

    try {
        // Check if user belongs to an organization
        const userOrg = await Organization.findOne({ users: userId });
        if (!userOrg) {
            return res.status(403).json({ message: 'You must belong to an organization to create tickets' });
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

        // Create the ticket
        const newTicket = new Ticket({
            user: userId,
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
            userId,
            'created',
            null,
            {
                summary: newTicket.summary,
                description: newTicket.description,
                priority: newTicket.priority,
                status: newTicket.status
            }
        );

        // Add ticket to organization
        userOrg.tickets.push(newTicket._id);
        await userOrg.save();

        return res.status(201).json({
            message: 'Ticket created successfully',
            ticket: newTicket
        });
    } catch (error) {
        console.error("Error creating ticket.\n\n", error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}