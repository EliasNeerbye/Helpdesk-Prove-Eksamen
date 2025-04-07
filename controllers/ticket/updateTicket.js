const Ticket = require('../../models/Ticket');
const Organization = require('../../models/Organization');
const { trackTicketHistory } = require('../../middleware/ticketHistory');

module.exports = async (req, res) => {
    const { ticketId } = req.params;
    const { status, priority } = req.body;
    const userId = req.user._id;
    const isAdmin = req.user.role === 'admin';
    
    if (!ticketId) {
        return res.status(400).json({ message: 'Ticket ID is required' });
    }
    
    // Check if user is an admin
    if (!isAdmin) {
        return res.status(403).json({ message: 'Only admins can update ticket status and priority' });
    }
    
    try {
        // Check if user belongs to an organization
        const userOrg = await Organization.findOne({ users: userId });
        if (!userOrg) {
            return res.status(403).json({ message: 'You must belong to an organization to update tickets' });
        }
        
        // Check if ticket exists and belongs to the user's organization
        const ticket = await Ticket.findOne({
            _id: ticketId,
            _id: { $in: userOrg.tickets }
        });
        
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found or not accessible' });
        }
        
        // Update fields
        const updateData = {};
        
        if (status) {
            const validStatuses = ['open', 'in-progress', 'resolved', 'closed', 'canceled'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ message: 'Invalid status' });
            }
            updateData.status = status;
        }
        
        if (priority) {
            const validPriorities = ['low', 'medium', 'high'];
            if (!validPriorities.includes(priority)) {
                return res.status(400).json({ message: 'Invalid priority' });
            }
            updateData.priority = priority;
        }
        
        // Track changes before updating
        if (status && ticket.status !== status) {
            await trackTicketHistory(
                ticketId,
                req.user._id,
                'status_changed',
                ticket.status,
                status
            );
        }
        
        if (priority && ticket.priority !== priority) {
            await trackTicketHistory(
                ticketId,
                req.user._id,
                'priority_changed',
                ticket.priority,
                priority
            );
        }
        
        // Update the ticket
        const updatedTicket = await Ticket.findByIdAndUpdate(
            ticketId,
            updateData,
            { new: true }
        ).populate('user', 'email').populate('category', 'name');
        
        return res.status(200).json({
            message: 'Ticket updated successfully',
            ticket: updatedTicket
        });
    } catch (error) {
        console.error("Error updating ticket.\n\n", error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}