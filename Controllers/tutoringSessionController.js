import TutoringSession from "../models/TutoringSessionModel.js";

// ─── Helper ──────────────────────────────────────────────────────────────────
const notFound = (res, msg = "Session not found") =>
  res.status(404).json({ success: false, message: msg });

// ─── CREATE SESSION ───────────────────────────────────────────────────────────
export const createSession = async (req, res) => {
  // Temporarily use a hardcoded ID until auth middleware is implemented
  // Replace req.body.tutor with req.user._id when protect middleware is ready
  const session = await TutoringSession.create(req.body);
  res.status(201).json({ success: true, data: session });
};

// ─── GET ALL SESSIONS (with filtering & pagination) ───────────────────────────
export const getAllSessions = async (req, res) => {
  const {
    subject,
    grade,
    status,
    isOnline,
    search,
    page = 1,
    limit = 10,
  } = req.query;

  const filter = {};

  // Categorical filters
  if (subject) filter.subject = subject;
  if (grade) filter.grade = grade;
  if (status) filter.status = status;
  if (isOnline !== undefined) filter.isOnline = isOnline === "true";

  // Full-text search on title and description
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const total = await TutoringSession.countDocuments(filter);

  const sessions = await TutoringSession.find(filter)
    .populate("tutor", "fullName email avatar")
    .populate("participants", "fullName email avatar")
    .sort({ sessionDate: 1, startTime: 1 }) // soonest first
    .skip(skip)
    .limit(Number(limit));

  res.status(200).json({
    success: true,
    count: sessions.length,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit)),
    data: sessions,
  });
};

// ─── GET SINGLE SESSION ───────────────────────────────────────────────────────
export const getSingleSession = async (req, res) => {
  const session = await TutoringSession.findById(req.params.id)
    .populate("tutor", "fullName email avatar phoneNumber")
    .populate("participants", "fullName email avatar");

  if (!session) return notFound(res);

  res.status(200).json({ success: true, data: session });
};

// ─── UPDATE SESSION ───────────────────────────────────────────────────────────
export const updateSession = async (req, res) => {
  // Prevent direct manipulation of participants array via update
  delete req.body.participants;

  const session = await TutoringSession.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!session) return notFound(res);

  res.status(200).json({ success: true, data: session });
};

// ─── DELETE SESSION ───────────────────────────────────────────────────────────
export const deleteSession = async (req, res) => {
  const session = await TutoringSession.findByIdAndDelete(req.params.id);

  if (!session) return notFound(res);

  res
    .status(200)
    .json({ success: true, message: "Session deleted successfully" });
};

// ─── JOIN SESSION ─────────────────────────────────────────────────────────────
export const joinSession = async (req, res) => {
  const session = await TutoringSession.findById(req.params.id);
  if (!session) return notFound(res);

  // userId comes from req.body until auth middleware is in place
  // Replace with req.user._id once protect middleware is ready
  const userId = req.body.userId;
  if (!userId) {
    return res
      .status(400)
      .json({ success: false, message: "userId is required" });
  }

  // Block if session is not upcoming
  if (session.status !== "upcoming") {
    return res.status(400).json({
      success: false,
      message: `Cannot join a session with status: ${session.status}`,
    });
  }

  // Block if at capacity
  if (session.participants.length >= session.maxCapacity) {
    return res
      .status(400)
      .json({ success: false, message: "Session is at full capacity" });
  }

  // Block if tutor tries to join own session
  if (session.tutor.toString() === userId) {
    return res
      .status(400)
      .json({ success: false, message: "Tutor cannot join their own session" });
  }

  // Block if already joined
  if (session.participants.some((p) => p.toString() === userId)) {
    return res
      .status(400)
      .json({ success: false, message: "You have already joined this session" });
  }

  session.participants.push(userId);
  await session.save();

  res.status(200).json({
    success: true,
    message: "Successfully joined the session",
    enrolledCount: session.participants.length,
    availableSpots: session.maxCapacity - session.participants.length,
    data: session,
  });
};

// ─── LEAVE SESSION ────────────────────────────────────────────────────────────
export const leaveSession = async (req, res) => {
  const session = await TutoringSession.findById(req.params.id);
  if (!session) return notFound(res);

  const userId = req.body.userId;
  if (!userId) {
    return res
      .status(400)
      .json({ success: false, message: "userId is required" });
  }

  if (session.status !== "upcoming") {
    return res.status(400).json({
      success: false,
      message: `Cannot leave a session with status: ${session.status}`,
    });
  }

  const participantIndex = session.participants.findIndex(
    (p) => p.toString() === userId
  );

  if (participantIndex === -1) {
    return res
      .status(400)
      .json({ success: false, message: "You are not enrolled in this session" });
  }

  session.participants.splice(participantIndex, 1);
  await session.save();

  res.status(200).json({
    success: true,
    message: "Successfully left the session",
    enrolledCount: session.participants.length,
    availableSpots: session.maxCapacity - session.participants.length,
  });
};

// ─── GET MY SESSIONS (as tutor or participant) ────────────────────────────────
export const getMySessions = async (req, res) => {
  // Replace req.body.userId with req.user._id once auth middleware is ready
  const userId = req.query.userId;
  if (!userId) {
    return res
      .status(400)
      .json({ success: false, message: "userId query param is required" });
  }

  const sessions = await TutoringSession.find({
    $or: [{ tutor: userId }, { participants: userId }],
  })
    .populate("tutor", "fullName email avatar")
    .sort({ sessionDate: 1 });

  res.status(200).json({ success: true, count: sessions.length, data: sessions });
};
