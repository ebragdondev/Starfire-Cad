<script lang="ts">
  import { PUBLIC_API_URL } from '$env/static/public';
  let users: any[] = [];
  let communities: any[] = [];
  let error = '';
  (async () => {
    try {
      const u = await fetch(`${PUBLIC_API_URL}/admin/users`, { credentials: 'include' }).then(r => r.json());
      const c = await fetch(`${PUBLIC_API_URL}/admin/communities`, { credentials: 'include' }).then(r => r.json());
      users = u.users; communities = c.communities;
    } catch { error = 'Unauthorized or server error'; }
  })();
</script>

<h1 class="text-2xl font-semibold">Global Admin</h1>
{#if error}<div class="text-red-600">{error}</div>{/if}
<h2 class="text-lg mt-4 mb-1">Users</h2>
<ul class="text-sm space-y-1">
  {#each users as u}<li>{u.username} · {u.email} · {u.globalRole}</li>{/each}
</ul>
<h2 class="text-lg mt-4 mb-1">Communities</h2>
<ul class="text-sm space-y-1">
  {#each communities as c}<li>{c.name} ({c.slug})</li>{/each}
</ul>