const Profile = require('../../models/Profile');
const Profession = require('../../models/Profession');
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

        // Validate profession if provided
        if (profession) {
            const professionExists = await Profession.findById(profession);
            if (!professionExists) {
                return res.status(404).json({ message: 'Profession not found' });
            }
            updateFields.profession = profession;
        }

        // Handle profile picture upload
        if (req.files && req.files.profilePicture) {
            const uploadedFile = req.files.profilePicture;

            // Delete old profile picture if it exists
            const oldProfile = await Profile.findById(req.user.profile);
            if (oldProfile.profilePicture) {
                try {
                    await fs.unlink(path.join(__dirname, '../../public/assets/uploads', oldProfile.profilePicture));
                } catch (error) {
                    console.error('Error deleting old profile picture:', error);
                }
            }

            // Ensure the uploaded file has an extension
            const fileExtension = path.extname(uploadedFile.name) || '.jpg'; // Default to .jpg if no extension
            const newFileName = `${uploadedFile.md5}${fileExtension}`;
            const newFilePath = path.join(__dirname, '../../public/assets/uploads', newFileName);

            try {
                // Check if source file exists
                await fs.access(uploadedFile.tempFilePath);
                // Move the file from the temp directory to the uploads directory
                await fs.rename(uploadedFile.tempFilePath, newFilePath);
                updateFields.profilePicture = newFileName;
            } catch (error) {
                console.error('Error saving uploaded file:', error);
                return res.status(500).json({ message: 'Error saving profile picture' });
            }
        } else {
            console.log('No file uploaded or invalid file structure.');
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
        console.log('Updating profile with fields:', updateFields);
        const updatedProfile = await Profile.findByIdAndUpdate(
            req.user.profile,
            { $set: updateFields }, // Use $set to ensure fields are updated
            { new: true } // Return the updated document
        ).populate('profession');

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
        if (req.files) {
            try {
                await fs.unlink(req.files.tempFilePath);
            } catch (unlinkError) {
                console.error('Error deleting uploaded file:', unlinkError);
            }
        }
        return res.status(500).json({ message: 'Internal server error' });
    }
};