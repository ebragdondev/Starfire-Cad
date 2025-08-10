<script lang="ts">
  import { onMount } from 'svelte';
  import { io } from 'socket.io-client';
  import { PUBLIC_API_URL } from '$env/static/public';

  let welcome = '';
  onMount(() => {
    const socket = io(PUBLIC_API_URL, { withCredentials: true });
    socket.on('welcome', (d) => (welcome = d.message));
  });
</script>

<h1 class="text-2xl font-semibold mb-4">Dashboard</h1>
{#if welcome}
  <div class="text-sm text-green-700">{welcome}</div>
{/if}
<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div class="p-3 border rounded">Unit Status</div>
  <div class="p-3 border rounded">BOLO</div>
  <div class="p-3 border rounded md:col-span-2">Calls</div>
</div>