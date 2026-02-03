import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
    role: {
        type: String,
        required: true,
        enum: ['user', 'model', 'system']
    },
    content: {
        type: String, // Storing text content. For complex parts, might need structure, but text is fine for now.
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const ChatHistorySchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        unique: true
    },
    messages: [MessageSchema],
    lastActivity: {
        type: Date,
        default: Date.now
    }
});

// Prevent model recombination error in dev
const ChatHistory = mongoose.models.ChatHistory || mongoose.model('ChatHistory', ChatHistorySchema);

export default ChatHistory;
