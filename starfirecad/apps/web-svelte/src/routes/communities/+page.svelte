<script lang="ts">
  import { PUBLIC_API_URL } from '$env/static/public';
  let communities: any[] = [];
  let name = '';
  let error = '';
  (async () => {
    try {
      const d = await fetch(`${PUBLIC_API_URL}/communities`, { credentials: 'include' }).then(r => r.json());
      communities = d.communities;
    } catch { error = 'Unauthorized'; }
  })();
  async function createCommunity(e: Event) {
    e.preventDefault();
    const res = await fetch(`${PUBLIC_API_URL}/communities`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ name }) });
    if (res.ok) { name = ''; const d = await res.json(); communities = [...communities, d.community]; }
  }
</script>

<h1 class="text-2xl font-semibold">Your Communities</h1>
{#if error}<div class="text-red-600">{error}</div>{/if}
<ul class="text-sm space-y-1">
  {#each communities as c}<li>{c.name} ({c.slug})</li>{/each}
</ul>
<form on:submit|preventDefault={createCommunity} class="flex gap-2 mt-3">
  <input bind:value={name} placeholder="Community name" class="p-2 border rounded flex-1" />
  <button class="px-4 py-2 bg-blue-600 text-white rounded">Create</button>
</form>