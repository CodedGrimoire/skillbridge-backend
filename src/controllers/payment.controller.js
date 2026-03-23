const { prisma } = require('../config/db');
const { stripe, createCheckoutSession } = require('../services/stripe.service');

const createSession = async (req, res, next) => {
  try {
    const { courseId, userId } = req.body || {};
    if (!courseId || !userId) return res.status(400).json({ message: 'courseId and userId required' });
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    const url = await createCheckoutSession(course, userId);
    res.json({ url });
  } catch (err) {
    next(err);
  }
};

const verifySession = async (req, res) => {
  const sessionId = req.query.session_id;
  if (!sessionId) return res.status(400).json({ message: 'session_id required' });

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const courseId = session.metadata?.courseId;
    const userId = session.metadata?.userId;
    if (session.payment_status === 'paid' && courseId && userId) {
      await prisma.purchase.upsert({
        where: { userId_courseId: { userId, courseId } },
        update: {},
        create: { userId, courseId },
      });
      return res.json({ status: 'paid' });
    }
    return res.status(400).json({ status: session.payment_status || 'unpaid' });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

module.exports = { createSession, verifySession };
