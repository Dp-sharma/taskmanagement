import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a school name'],
    trim: true,
  },
  address: {
    type: String,
    default: '',
  },
  contactPerson: {
    type: String,
    default: '',
  },
  phone: {
    type: String,
    default: '',
  },
  stage: {
    type: String,
    enum: ['Pitching', 'Installation', 'Training', 'Performance tracing', 'General', 'Onboarded', 'Inactive'],
    default: 'Pitching',
  },
  notes: [{
    content: String,
    createdAt: { type: Date, default: Date.now }
  }],
  tasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }],
  lastFollowUp: {
    type: Date,
    default: Date.now,
  },
  nextFollowUp: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Lead = mongoose.models.Lead || mongoose.model('Lead', leadSchema);

export default Lead;
