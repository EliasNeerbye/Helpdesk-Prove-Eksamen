const Ticket = require('../../models/Ticket');
const Comment = require('../../models/Comment');
const TicketHistory = require('../../models/TicketHistory');
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
        
        // Begin transaction operations
        const session = await Ticket.startSession();
        session.startTransaction();
        
        try {
            // Delete all comments related to the ticket
            await Comment.deleteMany({ ticket: ticketId }, { session });
            
            // Delete ticket history
            await TicketHistory.deleteMany({ ticket: ticketId }, { session });
            
            // Remove ticket from organization
            await Organization.updateOne(
                { _id: userOrg._id },
                { $pull: { tickets: ticketId } },
                { session }
            );
            
            // Delete the ticket
            await Ticket.findByIdAndDelete(ticketId, { session });
            
            // Commit the transaction
            await session.commitTransaction();
            session.endSession();
            
            return res.status(200).json({
                message: 'Ticket deleted successfully'
            });
        } catch (error) {
            // Abort transaction on error
            await session.abortTransaction();
            session.endSession();
            console.error("Error in delete ticket transaction.\n\n", error);
            return res.status(500).json({ message: 'Error deleting ticket' });
        }
    } catch (error) {
        console.error("Error deleting ticket.\n\n", error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};