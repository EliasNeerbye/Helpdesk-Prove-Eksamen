const Ticket = require('../../models/Ticket');
const Comment = require('../../models/Comment');
const TicketHistory = require('../../models/TicketHistory');
const Feedback = require('../../models/Feedback');
const Organization = require('../../models/Organization');

module.exports = async (req, res) => {
    const { ticketId } = req.params;
    const userId = req.user._id;
    
    // Ensure admin role
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Only admins can delete tickets' });
    }
    
    if (!ticketId) {
        return res.status(400).json({ message: 'Ticket ID is required' });
    }
    
    try {
        // Check if user belongs to an organization
        const userOrg = await Organization.findOne({ users: userId });
        if (!userOrg) {
            return res.status(403).json({ message: 'You must belong to an organization to delete tickets' });
        }
        
        // Check if ticket exists and belongs to the user's organization
        const ticket = await Ticket.findOne({
            _id: ticketId,
            organization: userOrg._id
        });
        
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found or not accessible' });
        }
        
        // Check if ticket is resolved or closed before deletion
        if (ticket.status !== 'resolved' && ticket.status !== 'closed') {
            return res.status(400).json({ message: 'Only resolved or closed tickets can be deleted' });
        }
        
        // Delete all comments related to the ticket
        await Comment.deleteMany({ ticket: ticketId });
        
        // Delete ticket history
        await TicketHistory.deleteMany({ ticket: ticketId });
        
        // Delete feedback related to the ticket
        await Feedback.deleteMany({ ticket: ticketId });
        
        // Remove ticket from organization
        await Organization.updateOne(
            { _id: userOrg._id },
            { $pull: { tickets: ticketId } }
        );
        
        // Delete the ticket
        await Ticket.findByIdAndDelete(ticketId);
        
        return res.status(200).json({
            message: 'Ticket deleted successfully'
        });
    } catch (error) {
        console.error("Error deleting ticket.\n\n", error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};