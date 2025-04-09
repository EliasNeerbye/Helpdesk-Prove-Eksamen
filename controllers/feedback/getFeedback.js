const Feedback = require('../../models/Feedback');
const Ticket = require('../../models/Ticket');

module.exports = async (req, res) => {
    const { ticketId } = req.params;
    
    if (!ticketId) {
        return res.status(400).json({ message: 'Ticket ID is required' });
    }
    
    try {
        // Find feedback for the ticket
        const feedback = await Feedback.findOne({ ticket: ticketId })
            .populate('user', 'email')
            .populate('ticket', 'summary');
        
        if (!feedback) {
            return res.status(404).json({ message: 'No feedback found for this ticket' });
        }
        
        return res.status(200).json({
            message: 'Feedback retrieved successfully',
            feedback
        });
    } catch (error) {
        console.error('Error retrieving feedback:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};