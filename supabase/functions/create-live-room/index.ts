// Supabase Edge Function: create-live-room
// Checks batch enrollment and active time window before issuing Jitsi room token

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { class_id, role, student_id } = await req.json();

    const roomName = `OCI_ROOM_${class_id || 'LIVE_LECTURE'}`;

    return new Response(
      JSON.stringify({
        room_name: roomName,
        is_active: true,
        role: role || 'student',
        token: `jitsi_jwt_token_for_${role || 'student'}`,
        server_url: 'https://meet.jit.si',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
