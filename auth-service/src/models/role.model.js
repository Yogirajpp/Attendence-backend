import mongoose from 'mongoose';

const permissionSchema = new mongoose.Schema({
  resource: {
    type: String,
    required: true
  },
  actions: {
    type: [String],
    enum: ['create', 'read', 'update', 'delete'],
    required: true
  }
});

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  permissions: {
    type: [permissionSchema],
    default: []
  },
  isSystem: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Method to check if role has permission for an action on a resource
roleSchema.methods.hasPermission = function(resource, action) {
  const permission = this.permissions.find(p => p.resource === resource);
  if (!permission) return false;
  return permission.actions.includes(action);
};

const Role = mongoose.model('Role', roleSchema);

export default Role;