// models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActiveDate: { type: Date }, 
    timezone: { type: String, default: 'UTC' },
    tz_locked_at: { type: Date }, 
    freezeTokens: { type: Number, default: 1 } 
  },
  { timestamps: true }
);


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
     
      return next(new Error('Password is required'));
    }
    next();
  } catch (e) { next(e); }
});


userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};


userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.passwordHash;
    return ret;
  }
});

export default mongoose.model("User", userSchema);
