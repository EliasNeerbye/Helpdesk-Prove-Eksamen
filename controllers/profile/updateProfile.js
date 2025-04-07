const Profile = require('../../models/Profile');
const fs = require('fs').promises;
const path = require('path');

module.exports = async (req, res) => {
    const { firstName, lastName, phone, profession } = req.body;

    if (!req.user.profile) {
        return res.status(404).json({ message: 'Profile not found' });
    }

    try {
        // Create update object with only provided fields
        const updateFields = {};
        if (firstName) updateFields.firstName = firstName;
        if (lastName) updateFields.lastName = lastName;
        if (phone) updateFields.phone = phone;
        if (profession) updateFields.profession = profession;

        // Handle profile picture upload
        if (req.file) {
            // Delete old profile picture if it exists
            const oldProfile = await Profile.findById(req.user.profile);
            if (oldProfile.profilePicture) {
                try {
                    await fs.unlink(path.join(__dirname, '../../uploads', oldProfile.profilePicture));
                } catch (error) {
                    console.error('Error deleting old profile picture:', error);
                }
            }
            
            updateFields.profilePicture = req.file.filename;
        }

        // Check if no fields were provided to update
        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        // If phone is being updated, check if it's already in use
        if (phone) {
            const existingProfile = await Profile.findOne({ 
                phone, 
                _id: { $ne: req.user.profile } 
            });
            if (existingProfile) {
                return res.status(400).json({ message: 'Phone number already in use' });
            }
        }

        // Update the profile
        const updatedProfile = await Profile.findByIdAndUpdate(
            req.user.profile,
            updateFields,
            { new: true }
        );

        if (!updatedProfile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        return res.status(200).json({
            message: 'Profile updated successfully',
            profile: updatedProfile
        });

    } catch (error) {
        console.error("Error updating profile.\n\n", error);
        // If there's an error and a file was uploaded, delete it
        if (req.file) {
            try {
                await fs.unlink(req.file.path);
            } catch (unlinkError) {
                console.error('Error deleting uploaded file:', unlinkError);
            }
        }
        return res.status(500).json({ message: 'Internal server error' });
    }
}