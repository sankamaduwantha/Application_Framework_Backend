import mongoose from "mongoose";

const TutoringSessionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a session title"],
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    subject: {
      type: String,
      required: [true, "Please provide a subject"],
      trim: true,
      enum: [
        "Mathematics",
        "Science",
        "Physics",
        "Chemistry",
        "Biology",
        "English",
        "History",
        "Geography",
        "Computer Science",
        "Other",
      ],
    },
    grade: {
      type: String,
      required: [true, "Please provide a grade level"],
      trim: true,
      enum: [
        "Grade 6",
        "Grade 7",
        "Grade 8",
        "Grade 9",
        "Grade 10",
        "Grade 11",
        "Grade 12",
        "Other",
      ],
    },
    tutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide a tutor"],
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    maxCapacity: {
      type: Number,
      required: [true, "Please provide maximum capacity"],
      min: [1, "Capacity must be at least 1"],
      max: [50, "Capacity cannot exceed 50"],
      default: 10,
    },
    sessionDate: {
      type: Date,
      required: [true, "Please provide a session date"],
    },
    startTime: {
      type: String,
      required: [true, "Please provide a start time (HH:MM)"],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "Please provide valid time (HH:MM)"],
    },
    duration: {
      type: Number, // minutes
      required: [true, "Please provide session duration in minutes"],
      min: [15, "Duration must be at least 15 minutes"],
      max: [300, "Duration cannot exceed 300 minutes"],
    },
    location: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "Online",
    },
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      default: "upcoming",
    },
    isOnline: {
      type: Boolean,
      default: true,
    },
    meetingLink: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Virtual: current enrollment count
TutoringSessionSchema.virtual("enrolledCount").get(function () {
  return this.participants.length;
});

// Virtual: available spots
TutoringSessionSchema.virtual("availableSpots").get(function () {
  return this.maxCapacity - this.participants.length;
});

// Virtual: isFull
TutoringSessionSchema.virtual("isFull").get(function () {
  return this.participants.length >= this.maxCapacity;
});

TutoringSessionSchema.set("toJSON", { virtuals: true });
TutoringSessionSchema.set("toObject", { virtuals: true });

export default mongoose.model("TutoringSession", TutoringSessionSchema);
