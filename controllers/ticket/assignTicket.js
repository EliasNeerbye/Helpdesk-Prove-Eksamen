const Ticket = require('../../models/Ticket');
const User = require('../../models/User');
const { trackTicketHistory } = require('../../middleware/ticketHistory');

module.exports = async (req, res) => {
    const { ticketId } = req.params;
    const { userId, role } = req.body;
    
    // Validate ticket ID
    if (!ticketId) {
        return res.status(400).json({ message: 'Ticket ID is required' });
    }
    
    // Validate assignment data
    if (!userId || !role) {
        return res.status(400).json({ message: 'User ID and role are required' });
    }
    
    // Verify role is valid
    if (!['1st-line', '2nd-line'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role. Must be 1st-line or 2nd-line' });
    }
    
    try {
        // Check if user exists and has the correct role
        const assignee = await User.findById(userId);
        if (!assignee) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        if (assignee.role !== role && assignee.role !== 'admin') {
            return res.status(400).json({ message: `User must have ${role} role to be assigned` });
        }
        
        // Find the ticket
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }
        
        // Update ticket assignment
        const prevAssignee = ticket.assignedTo;
        const prevRole = ticket.assignedRole;
        
        ticket.assignedTo = userId;
        ticket.assignedRole = role;
        
        await ticket.save();
        
        // Track assignment in history
        await trackTicketHistory(
            ticketId,
            req.user._id,
            'ticket_assigned',
            prevAssignee ? { assignee: prevAssignee, role: prevRole } : null,
            { assignee: userId, role }
        );
        
        // Return updated ticket
        const updatedTicket = await Ticket.findById(ticketId)
            .populate('assignedTo', 'email role')
            .populate('user', 'email')
            .populate('category', 'name');
        
        return res.status(200).json({
            message: 'Ticket assigned successfully',
            ticket: updatedTicket
        });
    } catch (error) {
        console.error('Error assigning ticket:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};