const Ticket = require('../../models/Ticket');
const Organization = require('../../models/Organization');

module.exports = async (req, res) => {
    const userId = req.user._id;
    const isAdmin = req.user.role === 'admin';
    
    if (!isAdmin) {
        return res.status(403).json({ message: 'Only admins can access ticket statistics' });
    }
    
    try {
        // Check if user belongs to an organization
        const userOrg = await Organization.findOne({ users: userId });
        if (!userOrg) {
            return res.status(403).json({ 
                message: 'You must belong to an organization to view ticket statistics',
                stats: {
                    total: 0,
                    byStatus: { open: 0, inProgress: 0, resolved: 0, closed: 0, canceled: 0 },
                    byPriority: { low: 0, medium: 0, high: 0 }
                }
            });
        }
        
        // Get tickets for this organization
        const tickets = await Ticket.find({ _id: { $in: userOrg.tickets } });
        
        // Calculate statistics
        const stats = {
            total: tickets.length,
            byStatus: {
                open: tickets.filter(t => t.status === 'open').length,
                inProgress: tickets.filter(t => t.status === 'in-progress').length,
                resolved: tickets.filter(t => t.status === 'resolved').length,
                closed: tickets.filter(t => t.status === 'closed').length,
                canceled: tickets.filter(t => t.status === 'canceled').length
            },
            byPriority: {
                low: tickets.filter(t => t.priority === 'low').length,
                medium: tickets.filter(t => t.priority === 'medium').length,
                high: tickets.filter(t => t.priority === 'high').length
            }
        };
        
        return res.status(200).json({
            message: 'Ticket statistics retrieved successfully',
            organization: userOrg.name,
            stats
        });
    } catch (error) {
        console.error("Error retrieving ticket statistics.\n\n", error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}