const Feedback = require('../../models/Feedback');
const Ticket = require('../../models/Ticket');

module.exports = async (req, res) => {
    const { ticketId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;
    
    if (!ticketId) {
        return res.status(400).json({ message: 'Ticket ID is required' });
    }
    
    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Valid rating (1-5) is required' });
    }
    
    try {
        // Verify the ticket exists and belongs to this user
        const ticket = await Ticket.findOne({
            _id: ticketId,
            user: userId
        });
        
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found or not accessible' });
        }
        
        // Verify ticket is resolved
        if (ticket.status !== 'resolved') {
            return res.status(400).json({ message: 'Feedback can only be provided for resolved tickets' });
        }
        
        // Check if feedback already exists for this ticket
        const existingFeedback = await Feedback.findOne({ ticket: ticketId });
        if (existingFeedback) {
            return res.status(400).json({ message: 'Feedback has already been provided for this ticket' });
        }
        
        // Create new feedback
        const newFeedback = new Feedback({
            ticket: ticketId,
            user: userId,
            rating,
            comment: comment || ''
        });
        
        await newFeedback.save();
        
        // Mark ticket as closed after feedback
        ticket.status = 'closed';
        await ticket.save();
        
        return res.status(201).json({
            message: 'Feedback submitted successfully',
            feedback: newFeedback
        });
    } catch (error) {
        console.error('Error submitting feedback:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};