const TicketHistory = require('../models/TicketHistory');

// Helper function to track ticket history
const trackTicketHistory = async (ticketId, userId, action, prevValue, newValue, meta = {}) => {
    try {
        const historyEntry = new TicketHistory({
            ticket: ticketId,
            user: userId,
            action,
            prevValue,
            newValue,
            meta
        });
        
        await historyEntry.save();
    } catch (error) {
        console.error('Error tracking ticket history:', error);
        // Don't throw error to avoid blocking the main operation
    }
};

module.exports = { trackTicketHistory };