const Contact = require('../models/Contact');

// Submit a contact form
exports.submitContact = async (req, res) => {
  try {
    const { name, phone, email, subject, message } = req.body;
    const userId = req.user?.id;

    if (!name || !phone || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const contact = await Contact.create({
      userId,
      name,
      phone,
      email,
      subject,
      message,
    });

    res.status(201).json({ success: true, message: 'Contact form submitted successfully', data: contact });
  } catch (err) {
    console.error('Error submitting contact:', err);
    res.status(500).json({ success: false, message: 'Failed to submit contact form' });
  }
};

// Get all contact submissions (admin only)
exports.getAllContacts = async (req, res) => {
  try {
    const userId = req.user?.id;

    // Check if user is admin (you may have an admin role check - adjust as needed)
    const contacts = await Contact.find()
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: contacts });
  } catch (err) {
    console.error('Error fetching contacts:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch contacts' });
  }
};

// Get contact by ID
exports.getContactById = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findById(id).populate('userId', 'name email phone');

    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    res.status(200).json({ success: true, data: contact });
  } catch (err) {
    console.error('Error fetching contact:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch contact' });
  }
};

// Update contact status or admin notes (admin only)
exports.updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const contact = await Contact.findByIdAndUpdate(
      id,
      { status, adminNotes },
      { new: true }
    ).populate('userId', 'name email phone');

    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    res.status(200).json({ success: true, message: 'Contact updated successfully', data: contact });
  } catch (err) {
    console.error('Error updating contact:', err);
    res.status(500).json({ success: false, message: 'Failed to update contact' });
  }
};

// Delete contact (admin only)
exports.deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findByIdAndDelete(id);

    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    res.status(200).json({ success: true, message: 'Contact deleted successfully' });
  } catch (err) {
    console.error('Error deleting contact:', err);
    res.status(500).json({ success: false, message: 'Failed to delete contact' });
  }
};

// Get contacts statistics (admin only)
exports.getContactStats = async (req, res) => {
  try {
    const total = await Contact.countDocuments();
    const pending = await Contact.countDocuments({ status: 'pending' });
    const read = await Contact.countDocuments({ status: 'read' });
    const resolved = await Contact.countDocuments({ status: 'resolved' });

    res.status(200).json({
      success: true,
      data: { total, pending, read, resolved },
    });
  } catch (err) {
    console.error('Error fetching contact stats:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch contact statistics' });
  }
};
