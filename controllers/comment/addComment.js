const Comment = require('../../models/Comment');
const Ticket = require('../../models/Ticket');
const Organization = require('../../models/Organization');
const path = require('path');
const fs = require('fs').promises;
const { trackTicketHistory } = require('../../middleware/ticketHistory');

module.exports = async (req, res) => {
    const { ticketId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;
    
    if (!ticketId || !content) {
        return res.status(400).json({ message: 'Ticket ID and comment content are required' });
    }
    
    try {
        // Check if user belongs to an organization
        const userOrg = await Organization.findOne({ users: userId });
        if (!userOrg) {
            return res.status(403).json({ message: 'You must belong to an organization to comment on tickets' });
        }
        
        // Verify the ticket exists and belongs to the user's organization
        const ticket = await Ticket.findOne({
            _id: ticketId,
            _id: { $in: userOrg.tickets }
        });
        
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found or not accessible' });
        }
        
        // Verify user has access to this ticket (is admin or ticket owner)
        const isAdmin = req.user.role === 'admin';
        if (!isAdmin && ticket.user.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Not authorized to comment on this ticket' });
        }
        
        // Handle file uploads if any
        const attachments = [];
        
        if (req.files && Object.keys(req.files).length > 0) {
            const uploadDir = path.join(__dirname, '../../public/assets/uploads/comments');
            
            // Ensure the upload directory exists
            try {
                await fs.mkdir(uploadDir, { recursive: true });
            } catch (err) {
                console.error('Error creating upload directory:', err);
            }
            
            // Process each uploaded file
            const fileArray = Array.isArray(req.files.attachments) 
                ? req.files.attachments 
                : [req.files.attachments];
            
            for (const file of fileArray) {
                const fileName = `${Date.now()}-${file.name}`;
                const filePath = path.join(uploadDir, fileName);
                
                try {
                    await file.mv(filePath);
                    attachments.push(fileName);
                } catch (err) {
                    console.error('Error saving file:', err);
                    // Continue with other files even if one fails
                }
            }
        }
        
        // Create the comment
        const newComment = new Comment({
            user: userId,
            ticket: ticketId,
            content,
            attachments
        });
        
        await newComment.save();
        
        // Track comment addition in ticket history
        await trackTicketHistory(
            ticketId,
            userId,
            'commented',
            null,
            { commentId: newComment._id },
            { content: content.substring(0, 100) + (content.length > 100 ? '...' : '') }
        );
        
        // Populate user information for response
        const populatedComment = await Comment.findById(newComment._id)
            .populate('user', 'email');
        
        return res.status(201).json({
            message: 'Comment added successfully',
            comment: populatedComment
        });
    } catch (error) {
        console.error("Error adding comment.\n\n", error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}