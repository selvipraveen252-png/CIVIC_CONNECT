import mongoose, { Document, Schema } from 'mongoose';

export type IssueCategory =
  | 'Road Damage'
  | 'Pothole'
  | 'Water Leakage'
  | 'Garbage Overflow'
  | 'Streetlight Failure'
  | 'Drainage Problem'
  | 'Traffic Problem'
  | 'Public Infrastructure'
  | 'Other';

export type IssuePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type IssueStatus =
  | 'REPORTED'
  | 'VERIFIED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CLOSED'
  | 'REJECTED'
  | 'REOPENED';

export interface IStatusHistoryItem {
  status: IssueStatus;
  changedBy: mongoose.Types.ObjectId;
  changedAt: Date;
  remarks?: string;
  evidenceImage?: string;
}

export interface IIssue extends Document {
  title: string;
  description: string;
  category: IssueCategory;
  priority: IssuePriority;
  status: IssueStatus;
  image?: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  address: string;
  reportedBy: mongoose.Types.ObjectId;
  assignedDepartment?: mongoose.Types.ObjectId;
  assignedOfficer?: mongoose.Types.ObjectId;
  statusHistory: IStatusHistoryItem[];
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const StatusHistorySchema = new Schema<IStatusHistoryItem>(
  {
    status: {
      type: String,
      enum: [
        'REPORTED',
        'VERIFIED',
        'ASSIGNED',
        'IN_PROGRESS',
        'RESOLVED',
        'CLOSED',
        'REJECTED',
        'REOPENED',
      ],
      required: true,
    },
    changedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
    remarks: {
      type: String,
      default: '',
    },
    evidenceImage: {
      type: String,
      default: '',
    },
  },
  { _id: true }
);

const IssueSchema = new Schema<IIssue>(
  {
    title: {
      type: String,
      required: [true, 'Please provide issue title'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide issue description'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: [
        'Road Damage',
        'Pothole',
        'Water Leakage',
        'Garbage Overflow',
        'Streetlight Failure',
        'Drainage Problem',
        'Traffic Problem',
        'Public Infrastructure',
        'Other',
      ],
      default: 'Other',
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
    },
    status: {
      type: String,
      enum: [
        'REPORTED',
        'VERIFIED',
        'ASSIGNED',
        'IN_PROGRESS',
        'RESOLVED',
        'CLOSED',
        'REJECTED',
        'REOPENED',
      ],
      default: 'REPORTED',
    },
    image: {
      type: String,
      default: '',
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    address: {
      type: String,
      required: [true, 'Please provide an address or landmark'],
      trim: true,
    },
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedDepartment: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    assignedOfficer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    statusHistory: {
      type: [StatusHistorySchema],
      default: [],
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Create 2dsphere index on location for geospatial queries
IssueSchema.index({ location: '2dsphere' });
IssueSchema.index({ status: 1 });
IssueSchema.index({ category: 1 });
IssueSchema.index({ priority: 1 });
IssueSchema.index({ reportedBy: 1 });
IssueSchema.index({ assignedDepartment: 1 });
IssueSchema.index({ assignedOfficer: 1 });

export const Issue = mongoose.model<IIssue>('Issue', IssueSchema);
export default Issue;
