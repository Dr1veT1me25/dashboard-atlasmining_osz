export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (url.pathname === "/api/comments" && request.method === "GET") {
      try {
        const { results } = await env.DB.prepare("SELECT * FROM comments").all();
        return new Response(JSON.stringify(results), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
      }
    }

    if (url.pathname === "/api/comments" && request.method === "POST") {
      try {
        const body = await request.json();
        const { order_number, comment_text, color_marker } = body;

        await env.DB.prepare(`
          INSERT INTO comments (order_number, comment_text, color_marker) 
          VALUES (?, ?, ?) 
          ON CONFLICT(order_number) DO UPDATE SET 
          comment_text = excluded.comment_text, 
          color_marker = excluded.color_marker,
          updated_at = CURRENT_TIMESTAMP
        `).bind(order_number, comment_text, color_marker).run();

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
      }
    }

    // Если это не API, отдаем статику (твой HTML, CSS, JS)
    return env.ASSETS.fetch(request);
  }
};
