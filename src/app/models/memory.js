import mongoose from 'mongoose';

const memorySchema = new mongoose.Schema({
  key: {
    type: String, // e.g., "Deepansh_ERP_Role", "Favorite_School"
    required: true,
    unique: true,
    trim: true,
  },
  value: {
    type: String, // e.g., "ERP Owner", "DAV School"
    required: true,
  },
  aiExtracted: {
    type: Boolean,
    default: true, // True if AI automatically discovered it
  },
  userControllable: {
    type: Boolean,
    default: true,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

const Memory = mongoose.models.Memory || mongoose.model('Memory', memorySchema);

export default Memory;
