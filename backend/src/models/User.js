// models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true }
  },
  { timestamps: true }
);

// Virtual: allow setting 'password' even though we store 'passwordHash'
userSchema.virtual('password')
  .set(function (plain) { this._password = plain; });

userSchema.pre('save', async function (next) {
  try {
    if (this.isModified('passwordHash')) return next();
    if (this._password) {
      const salt = await bcrypt.genSalt(10);
      this.passwordHash = await bcrypt.hash(this._password, salt);
    }
    if (!this.passwordHash) {
      // If neither _password nor passwordHash set, fail validation
      return next(new Error('Password is required'));
    }
    next();
  } catch (e) { next(e); }
});

// Instance method used by login
userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

// Clean JSON output
userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.passwordHash;
    return ret;
  }
});

export default mongoose.model("User", userSchema);
