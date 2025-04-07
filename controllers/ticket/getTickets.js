const Ticket = require('../../models/Ticket');
const Organization = require('../../models/Organization');

module.exports = async (req, res) => {
    const userId = req.user._id;
    const isAdmin = req.user.role === 'admin';
    
    try {
        // Check if user belongs to an organization
        const userOrg = await Organization.findOne({ users: userId });
        if (!userOrg) {
            return res.status(403).json({ 
                message: 'You must belong to an organization to view tickets',
                tickets: []
            });
        }
        
        let tickets;
        
        // If admin, get all tickets from the organization
        if (isAdmin) {
            tickets = await Ticket.find({ _id: { $in: userOrg.tickets } })
                .populate('user', 'email')
                .populate('category', 'name')
                .sort({ createdAt: -1 });
        } else {
            // Regular user - only get their tickets within the organization
            tickets = await Ticket.find({ 
                user: userId,
                _id: { $in: userOrg.tickets }
            })
                .populate('category', 'name')
                .sort({ createdAt: -1 });
        }
        
        return res.status(200).json({
            message: 'Tickets retrieved successfully',
            organization: userOrg.name,
            tickets
        });
    } catch (error) {
        console.error("Error retrieving tickets.\n\n", error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}