import { getSupabaseClient } from '../config/supabase.js';
import { FCM } from '../config/firebase.js';

export const NotificationService = {
  /**
   * Dispatches notifications to database and triggers FCM push
   */
  async broadcastNotification({ title, body, targetType = 'ALL', targetId = null, data = {} }) {
    const supabase = getSupabaseClient();
    const notificationId = `notif_${Date.now()}`;

    // 1. Record in Supabase notifications table
    if (supabase) {
      try {
        await supabase.from('notifications').insert({
          title,
          body,
          type: targetType,
          data: { ...data, targetId },
          read: false,
          created_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('[Notification DB Note]: Insertion warning:', err.message);
      }
    }

    // 2. Fetch device tokens from notification_tokens
    let tokens = [];
    if (supabase) {
      try {
        let query = supabase.from('notification_tokens').select('token').eq('active', true);
        if (targetId) {
          query = query.eq('user_id', targetId);
        }
        const { data: tokenRows } = await query;
        tokens = (tokenRows || []).map(r => r.token);
      } catch (tErr) {
        console.warn('[Notification Tokens Warning]: Query error:', tErr.message);
      }
    }

    // 3. Dispatch via FCM
    const fcmResult = await FCM.sendMulticast({
      tokens,
      title,
      body,
      data,
    });

    return {
      success: true,
      id: notificationId,
      title,
      body,
      targetType,
      targetId,
      dispatchedDevices: fcmResult.sent,
      sentAt: new Date().toISOString(),
    };
  },

  /**
   * Registers or updates a client FCM registration token
   */
  async registerToken({ userId, token, platform = 'web', browserDevice = '' }) {
    const supabase = getSupabaseClient();
    if (!supabase) return { success: true, mode: 'local' };

    const { data, error } = await supabase
      .from('notification_tokens')
      .upsert(
        {
          user_id: userId,
          token,
          platform,
          browser_device: browserDevice,
          active: true,
          last_seen: new Date().toISOString(),
        },
        { onConflict: 'token' }
      )
      .select()
      .single();

    if (error) throw error;
    return { success: true, record: data };
  }
};
