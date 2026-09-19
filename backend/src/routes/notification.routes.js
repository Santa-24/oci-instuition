import { Router } from 'express';
import { NotificationService } from '../services/notification-service.js';

const router = Router();

// Send broadcast or targeted notification
router.post('/send', async (req, res) => {
  try {
    const { title, body, targetType, targetId, data } = req.body;
    if (!title || !body) {
      return res.status(400).json({ error: 'title and body are required' });
    }

    const outcome = await NotificationService.broadcastNotification({
      title,
      body,
      targetType,
      targetId,
      data,
    });

    return res.status(200).json(outcome);
  } catch (err) {
    console.error('[Notification Dispatch Error]:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Register FCM device token
router.post('/register-token', async (req, res) => {
  try {
    const { userId, token, platform, browserDevice } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Device token is required' });
    }

    const outcome = await NotificationService.registerToken({
      userId,
      token,
      platform,
      browserDevice,
    });

    return res.status(200).json(outcome);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
