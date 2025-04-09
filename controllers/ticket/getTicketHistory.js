const TicketHistory = require('../../models/TicketHistory');
const Ticket = require('../../models/Ticket');
const Organization = require('../../models/Organization');

module.exports = async (req, res) => {
    const { ticketId } = req.params;
    const userId = req.user._id;
    const isAdmin = req.user.role === 'admin';
    
    if (!ticketId) {
        return res.status(400).json({ message: 'Ticket ID is required' });
    }
    
    try {
        // Check if user belongs to an organization
        const userOrg = await Organization.findOne({ users: userId });
        if (!userOrg) {
            return res.status(403).json({ message: 'You must belong to an organization to view ticket history' });
        }
        
        // Check if ticket exists and belongs to the user's organization
        const ticket = await Ticket.findOne({
            _id: ticketId,
        });
        
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found or not accessible' });
        }
        
        // Check if user has access to this ticket (is admin, owner, or assignee)
        const isTicketOwner = ticket.user.toString() === userId.toString();
        const isTicketAssignee = ticket.assignedTo && ticket.assignedTo.toString() === userId.toString();
        
        if (!isAdmin && !isTicketOwner && !isTicketAssignee) {
            return res.status(403).json({ message: 'Not authorized to view ticket history' });
        }
        
        // Get ticket history
        const history = await TicketHistory.find({ ticket: ticketId })
            .populate('user', 'email')
            .sort({ createdAt: 1 });
        
        return res.status(200).json({
            message: 'Ticket history retrieved successfully',
            history
        });
    } catch (error) {
        console.error("Error retrieving ticket history.\n\n", error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};